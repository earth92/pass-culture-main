import datetime
import decimal
import logging

import click
import sqlalchemy.orm as sqla_orm

import pcapi.core.finance.api as finance_api
import pcapi.core.finance.utils as finance_utils
import pcapi.core.offerers.models as offerers_models
import pcapi.core.offers.models as offers_models
from pcapi.models import db
from pcapi.models.feature import FeatureToggle
import pcapi.scheduled_tasks.decorators as cron_decorators
from pcapi.utils import human_ids
from pcapi.utils.blueprint import Blueprint
import pcapi.utils.date as date_utils


blueprint = Blueprint(__name__, __name__)
logger = logging.getLogger(__name__)


@blueprint.cli.command("price_bookings")
@cron_decorators.log_cron_with_transaction
@cron_decorators.cron_require_feature(FeatureToggle.PRICE_BOOKINGS)
def price_bookings() -> None:
    """Price bookings that have been recently marked as used."""
    finance_api.price_bookings()


@blueprint.cli.command("generate_cashflows_and_payment_files")
@click.option("--override-feature-flag", help="Override feature flag", is_flag=True, default=False)
@cron_decorators.log_cron_with_transaction
def generate_cashflows_and_payment_files(override_feature_flag: bool) -> None:
    flag = FeatureToggle.GENERATE_CASHFLOWS_BY_CRON
    if not override_feature_flag and not flag.is_active():
        logger.info("%s is not active, cronjob will not run.", flag.name)
        return
    last_day = datetime.date.today() - datetime.timedelta(days=1)
    cutoff = finance_utils.get_cutoff_as_datetime(last_day)
    finance_api.generate_cashflows_and_payment_files(cutoff)


@blueprint.cli.command("generate_invoices")
def generate_invoices() -> None:
    """Generate (and store) all invoices.

    This command can be run multiple times.
    """
    finance_api.generate_invoices()


@blueprint.cli.command("add_custom_offer_reimbursement_rule")
@click.option("--offer-humanized-id", required=True)
@click.option("--offer-original-amount", required=True)
@click.option("--offerer-id", type=int, required=True)
@click.option("--reimbursed-amount", required=True)
@click.option("--valid-from", required=True)
@click.option("--valid-until", required=False)
@click.option("--force", required=False, is_flag=True, help="Ignore warnings and create rule anyway")
def add_custom_offer_reimbursement_rule(
    offer_humanized_id: str,
    offer_original_amount: str,
    offerer_id: int,
    reimbursed_amount: str,
    valid_from: str,
    valid_until: str = None,
    force: bool = False,
) -> None:
    """Add a custom reimbursement rule that is linked to an offer."""
    offer_original_amount = decimal.Decimal(offer_original_amount.replace(",", "."))  # type: ignore [assignment]
    reimbursed_amount = decimal.Decimal(reimbursed_amount.replace(",", "."))  # type: ignore [assignment]

    offer_id = human_ids.dehumanize(offer_humanized_id)
    offer = (
        offers_models.Offer.query.options(
            sqla_orm.joinedload(offers_models.Offer.stocks, innerjoin=True),
            sqla_orm.joinedload(offers_models.Offer.venue, innerjoin=True),
        )
        .filter_by(id=offer_id)
        .one_or_none()
    )
    if not offer:
        print(f"Could not find offer: {offer_humanized_id}")
        return

    warnings = []
    if offer.venue.managingOffererId != offerer_id:
        warnings.append(f"Mismatch on offerer: given {offerer_id}, expected {offer.venue.managingOffererId}")

    stock_amounts = {stock.price for stock in offer.stocks}
    if len(stock_amounts) > 1:
        warnings.append(f"Possible mismatch on original amount: found multiple amounts in database: {stock_amounts}")
    stock_amount = stock_amounts.pop()
    if offer_original_amount != stock_amount:
        warnings.append(f"Mismatch on original amount: given {offer_original_amount}, expected {stock_amount}")

    if warnings:
        print("Found multiple warnings. Double-check that the command has been given the right information.")
        print("\n".join(warnings))
        if not force:
            print(
                "Command has failed. Use `--force` if you are really sure that you "
                "want to ignore warnings and proceed anyway."
            )
            return

    valid_from_dt = date_utils.get_day_start(
        datetime.date.fromisoformat(valid_from),
        finance_utils.ACCOUNTING_TIMEZONE,
    )
    valid_until_dt = (
        date_utils.get_day_start(
            datetime.date.fromisoformat(valid_until),
            finance_utils.ACCOUNTING_TIMEZONE,
        )
        if valid_until
        else None
    )

    rule = finance_api.create_offer_reimbursement_rule(
        offer_id=offer.id,
        amount=reimbursed_amount,  # type: ignore [arg-type]
        start_date=valid_from_dt,
        end_date=valid_until_dt,
    )
    print(f"Created new rule: {rule.id}")


class CheckError(Exception):
    pass


def check_can_move_siret(source_id: int, target_id: int, siret: str, override_revenue_check: bool) -> None:
    source = offerers_models.Venue.query.get(source_id)
    target = offerers_models.Venue.query.get(target_id)
    if source.managingOffererId != target.managingOffererId:
        raise CheckError(f"Source {source_id} and target {target_id} do not have the same offerer")
    offerer = target.managingOfferer
    if offerer.siren != siret[:9]:
        raise CheckError(f"SIRET {siret} does not match offerer SIREN {offerer.siren}")
    if source.siret != siret:
        raise CheckError(f"Source venue {source.id} has SIRET {source.siret}, not requested SIRET {siret}")
    if target.siret is not None:
        raise CheckError(f"Target venue {target.id} already has a siret: {target.siret}")

    if not override_revenue_check:
        # Calculate yearly revenue of target venue
        query = """
          select sum(booking.amount * booking.quantity) as "chiffre d'affaires"
          from booking
          where
            "venueId" = :target_id
            and "dateUsed" is not null
            -- On ajoute 1 heure pour la conversion UTC -> CET afin de récupérer
            -- le chiffre d'affaires de l'année en cours.
            and DATE_PART('year', "dateUsed" + interval '1 hour') = date_part('year', now() + interval '1 hour');
        """
        rows = db.session.execute(query, {"target_id": target_id}).fetchone()
        revenue = rows[0]
        if revenue and revenue > 10_000:
            raise CheckError("Target venue has an unexpectedly high yearly revenue.")


@blueprint.cli.command("move_siret")
@click.option("--src-venue-id", type=int, required=True)
@click.option("--dst-venue-id", type=int, required=True)
@click.option("--siret", required=True)
@click.option("--comment", required=True)
@click.option("--apply-changes", is_flag=True, default=False, required=False)
@click.option("--override-revenue-check", is_flag=True, default=False, required=False)
def move_siret(
    src_venue_id: int,
    dst_venue_id: int,
    siret: str,
    comment: str,
    apply_changes: bool = False,
    override_revenue_check: bool = False,
) -> None:
    try:
        check_can_move_siret(
            source_id=src_venue_id,
            target_id=dst_venue_id,
            siret=siret,
            override_revenue_check=override_revenue_check,
        )
    except CheckError as exc:
        print(str(exc))
        return

    db.session.rollback()  # discard any previous transaction to start a fresh new one.
    queries = [
        """
        update pricing
        set "pricingPointId" = :target_id
        where "pricingPointId" = :source_id
        """,
        """
        update venue_pricing_point_link
        set "pricingPointId" = :target_id
        where "pricingPointId" = :source_id
        """,
        """
        update venue
        set siret = NULL, comment = :comment
        where id = :source_id and siret = :siret
        """,
        """
        update venue
        set siret = :siret, comment = NULL
        where id = :target_id and siret IS NULL
        """,
        """
        insert into venue_pricing_point_link ("venueId", "pricingPointId", timespan)
        values (
          :target_id,
          :target_id,
          tsrange(now()::timestamp, NULL, '[)')
        )
        -- If the pricing point of the target venue was the source venue before our changes,
        -- the update above will have changed the existing row. Thus the source venue
        -- now points to itself, which means that we don't need to execute this insert
        -- (and it would raise an integrity error). Hence the "do nothing" below.
        on conflict do nothing
        """,
    ]

    db.session.begin()
    for query in queries:
        db.session.execute(
            query,
            {
                "source_id": src_venue_id,
                "target_id": dst_venue_id,
                "siret": siret,
                "comment": comment,
            },
        )
    if apply_changes:
        db.session.commit()
        print("Siret has been moved.")
    else:
        db.session.rollback()
        print("DRY RUN: NO CHANGES HAVE BEEN MADE")
