import { FC, useMemo, useRef, useState } from 'react'
import cls from 'classnames'
import { OrderDetails, TradeInAssetCondition } from '@common/endpoints/typings.gen'
import Carousal from '@components/Carousel'
import phoneNumberFormatFn from '@common/utilities/formatPhoneNumber'
import Accordion, { AccordionTab } from '@components/Accordion'
import Icon from '@components/Icon'
import Galleria, { GalleriaType } from '@components/Galleria'
import Swiper from 'swiper'
import SectionHeading from '@components/SectionHeading'
import Dialog from '@components/Dialog'
import { useModal } from 'react-modal-hook'
import { TradeInStatus } from '@common/endpoints/useDealSummary'
import { calculateTradeInBalance, formatNum } from '@common/utilities/formulae'

import TradeInForm from './TradeInForm'
import styles from './TradeIn.module.scss'

const messages = {
  heading: {
    tradeIn: 'Trade-In',
    dealerComments: "Dealer's Comments",
  },
}

/*
 Template for Items in Tradein View: takes a heading and a value,
 **
 */
const ItemTemplate: FC<{ heading: string; value?: string | number | undefined; wrapClass?: string }> = ({
  heading,
  value,
  wrapClass,
}) => (
  <p className={cls([styles.textWrap, wrapClass || ''])}>
    {heading}
    {value && <span className={styles['kbb-values-text']}>{value}</span>}
  </p>
)

/*
 ** Lease Balance Component
 */
const LeaseBalanceComponent: FC<{ order: OrderDetails }> = ({ order }) => (
  <>
    {' '}
    <p className={styles.totalHeading}>Lease/Loan Balance</p>
    <ItemTemplate
      heading="Contract No./Credit Reference:"
      value={`${order?.tradeInVehicle?.tradeInLeaseBalance?.contractNo || ''}`}
    />
    <ItemTemplate heading="Lender Name:" value={`${order?.tradeInVehicle?.tradeInLeaseBalance?.lenderName || ''}`} />
    <ItemTemplate
      heading="Lender Physical Address:"
      value={`${order?.tradeInVehicle?.tradeInLeaseBalance?.lenderPhysicalAddress || ''}`}
    />
    <ItemTemplate
      heading="Lender Phone Number:"
      value={`${phoneNumberFormatFn(order.tradeInVehicle?.tradeInLeaseBalance?.lenderPhoneNo) || ''}`}
    />
    <ItemTemplate
      heading="Payoff Amount:"
      value={`$${formatNum(order?.tradeInVehicle?.tradeInLeaseBalance?.leaseBalance)}`}
    />
  </>
)

/*
 ** TradeIn KBB values related Component
 */

type KbbComponentProps = { order: OrderDetails; isEditable: boolean; onEditTradeIn: () => void }

const KbbComponent: FC<KbbComponentProps> = ({ order, onEditTradeIn, isEditable }) => {
  const calculatedTradeInBalance = calculateTradeInBalance(order)
  return (
    <>
      {isEditable ? (
        <button onClick={() => onEditTradeIn()} className={cls('btn', styles.editBtn)}>
          Edit
          <Icon name="editPencil" className="ml-1" />
        </button>
      ) : (
        ''
      )}

      <p className={styles.totalHeading}>
        ${calculatedTradeInBalance?.tradeInBalance}
        {isEditable &&
        typeof order?.tradeInVehicle?.previousOffer === 'number' &&
        calculatedTradeInBalance?.previousTradeInBalance !== calculatedTradeInBalance?.tradeInBalance ? (
          <>
            <span> - </span>
            <del className="text-muted">${calculatedTradeInBalance?.previousTradeInBalance}</del>
          </>
        ) : (
          ''
        )}
      </p>
      <ItemTemplate heading="Blue Book Trade-In Value:" value={`$${formatNum(order?.tradeInVehicle?.KBBValue)}`} />
      <ItemTemplate heading="Our Offer:" value={`$${formatNum(order?.tradeInVehicle?.offer || 0)}`} />
      <ItemTemplate
        heading="Lease/Loan Balance:"
        value={`$${formatNum(
          order?.tradeInVehicle?.tradeInLeaseBalance?.leaseBalance ||
            order?.tradeInVehicle?.tradeInLeaseBalance?.previousLeaseBalance ||
            0,
        )}`}
      />
      <ItemTemplate heading="Net Trade-In Amount:" value={`$${calculatedTradeInBalance?.tradeInBalance || 0}`} />
      <ItemTemplate heading="Estimated Mileage:" value={`${formatNum(order?.tradeInVehicle?.odometer)}`} />
      <ItemTemplate heading="Condition:" value={`${order?.tradeInVehicle?.condition || ''}`} />
    </>
  )
}

/*
 ** TradeIn Main component
 */

type TradeInProps = {
  order: OrderDetails
  isEditable: boolean
  refetchOrderDetails?: (updatedTaxes?: boolean, tradeInStatus?: TradeInStatus) => unknown
  isTradeInFocused?: boolean
}

const TradinInfo: FC<TradeInProps> = ({ order, refetchOrderDetails, isEditable, isTradeInFocused }) => {
  // Boolean State to manage accordion open or close state
  const [isHeaderOpen, setIsHeaderOpen] = useState(false)
  const galleriaRef = useRef<GalleriaType>(null)
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [swiperRef, setSwiper] = useState<Swiper | null>(null)
  const show = () => {
    if (galleriaRef && galleriaRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      galleriaRef.current.show()
    }
  }
  // Create Asset Conditions Question list
  const questions = useMemo(() => {
    const firstLen =
      order.tradeInVehicle.tradeInAssetCondition.length > 5
        ? Math.round(order.tradeInVehicle.tradeInAssetCondition.length / 2)
        : order.tradeInVehicle.tradeInAssetCondition.length
    // First Column questions
    const first: TradeInAssetCondition[] = order.tradeInVehicle.tradeInAssetCondition.splice(0, firstLen)
    // Rest/Remaining questions
    const rest: TradeInAssetCondition[] = order.tradeInVehicle.tradeInAssetCondition.splice(
      -(order.tradeInVehicle.tradeInAssetCondition.length - firstLen),
    )
    return { first, rest }
  }, [order])
  const [onEditTradeIn, onClose] = useModal(
    () => (
      <Dialog
        onHide={() => {
          onClose()
        }}
        visible
        header={<SectionHeading>{messages.heading.tradeIn}</SectionHeading>}
        className={styles.tradeInForm}
      >
        <TradeInForm
          onFormClose={() => {
            onClose()
          }}
          tradeInVehicle={order.tradeInVehicle}
          orderId={order._id}
          refetchOrderDetails={() =>
            refetchOrderDetails?.(true, isTradeInFocused ? TradeInStatus.WithTradeIn : TradeInStatus.WithoutTradeIn)
          }
        />
      </Dialog>
    ),
    [order, refetchOrderDetails],
  )
  return (
    <>
      {order.tradeInVehicle.tradeInDocs.length > 0 && (
        <Galleria
          ref={galleriaRef}
          circular
          fullScreen
          numVisible={3}
          showItemNavigators
          onItemChange={e => {
            setSelectedImage(e.index)
            swiperRef?.slideTo(e.index)
          }}
          activeIndex={selectedImage}
          showThumbnails={false}
          className={styles.galleriaWrap}
          item={(item: string) => <img className={styles.gallery} src={item} alt="" />}
          value={order.tradeInVehicle.tradeInDocs.map(e => e.path)}
        />
      )}
      <div className="rounded bg-white p-4 p-xl-5 mb-2">
        <div className="row">
          {/* First Column */}

          <div className={cls(['mr-0 pr-0 col-sm-12 col-md-4 col-lg-4', styles['title-container']])}>
            <h2 className="section-subheading">{messages.heading.tradeIn}</h2>
            <p className={styles.title}>{`${order?.tradeInVehicle?.year || ''} ${order?.tradeInVehicle?.make || ''} ${
              order?.tradeInVehicle?.model || ''
            }`}</p>
            <div className={styles.divider} />
            <p className={styles.subheading}>{order?.tradeInVehicle?.trim || ''}</p>
          </div>

          {/* Image Slider Column */}

          <div className={cls([styles.carosalWrap, 'col-sm-12 col-md-4 col-lg-4 text-center'])}>
            <Carousal
              pagination
              slidesPerView={1}
              onSlideChange={e => setSelectedImage(e.activeIndex)}
              onSwiper={setSwiper}
              type="fraction"
              navigation
            >
              {order.tradeInVehicle.tradeInDocs.map(e => (
                <div className={styles.carosalImageWrapper}>
                  <div>
                    <Icon onClick={show} className={styles.expandImage} name="expand" size={32} />
                    <img className={styles.carosalImage} key={e?.name} src={e?.path} alt="Vehical TradeIn Images" />
                  </div>
                </div>
              ))}
            </Carousal>
          </div>

          {/* Third Column  | only show if space is not enough -> view summary */}

          <div className={cls(['col-sm-12 col-md-4 col-lg-4', styles.totalBalanceWrap])}>
            <KbbComponent order={order} isEditable={isEditable} onEditTradeIn={onEditTradeIn} />
          </div>
        </div>
        {/* View/Hide Extra Details */}

        <Accordion
          onTabOpen={() => setIsHeaderOpen(true)}
          onTabClose={() => setIsHeaderOpen(false)}
          expandIcon={styles.expandIcon}
          collapseIcon={styles.collapseIcon}
        >
          <AccordionTab
            headerClassName={cls([
              styles.tabHeader,
              order.tradeInVehicle.tradeInDocs.length > 0 && styles.tabHeaderWithImg,
            ])}
            header={isHeaderOpen ? 'View Less Details' : 'View More Details'}
          >
            <div className={styles.dividerAccordion} />
            <div className="row">
              {/* First Column */}
              {/* Not Available when space is enough */}
              <div className="col-sm-12 col-md-4 col-lg-4 text-left">
                <LeaseBalanceComponent order={order} />
              </div>

              {/* Second Column */}
              <div className="col-sm-12 col-md-4 col-lg-4 text-left">
                <p className={cls([styles.totalHeading, styles.assetHeading])}>Asset Condition Details</p>
                {/* First Five Questions in middle column */}

                {questions.first.map(e => (
                  <ItemTemplate heading={e.label} value={e.selectedValue} />
                ))}
              </div>
              {/* Third Column */}
              {/* Remaining Questions in next column */}
              <div className={cls(['col-sm-12 col-md-4 col-lg-4 text-left', styles.extendedQuestions])}>
                {questions.rest.map(e => (
                  <ItemTemplate heading={e.label} value={e.selectedValue} />
                ))}
              </div>
            </div>
            <div className={styles.dividerAccordion} />
            <div className="row">
              <div className="col-md-12">
                <p className={cls([styles.totalHeading, styles.assetHeading])}>{messages.heading.dealerComments}</p>
                <ItemTemplate value="" heading={order.tradeInVehicle?.comment || ''} wrapClass={styles.dealerComment} />
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </>
  )
}

export default TradinInfo
