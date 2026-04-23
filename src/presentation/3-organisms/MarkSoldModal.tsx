"use client"
import { FC, memo, useState } from "react"
import { useAppDispatch } from "../../store/hooks"
import { markItemSold } from "../../store/trackerSlice"
import {
  calcItemProfit,
  formatCurrency,
} from "../../utils/finance"
import type { Item, CostCategory } from "../../types"
import Button from "../1-atoms/Button"
import Input from "../1-atoms/Input"
import CostCell from "../1-atoms/CostCell"
import ProfitValue from "../1-atoms/ProfitValue"
import Modal from "../1-atoms/Modal"

interface Props {
  item: Item
  onClose: () => void
}

type DraftSaleCost = { tempId: string; category: CostCategory; label: string; amount: number }

const MarkSoldModal: FC<Props> = ({ item, onClose }) => {
  const dispatch = useAppDispatch()
  const [salePrice, setSalePrice] = useState("")
  const [salePriceError, setSalePriceError] = useState("")
  const [draftCosts, setDraftCosts] = useState<DraftSaleCost[]>([
    { tempId: "postage_out", category: "postage", label: "Postage Out", amount: 0 }
  ])

  const parsedPrice = Number(salePrice)
  const totalSaleCosts = draftCosts.reduce((s, c) => s + c.amount, 0)
  const activeCosts = draftCosts.filter((c) => c.amount > 0)

  const previewProfit =
    !isNaN(parsedPrice) && parsedPrice > 0
      ? calcItemProfit(parsedPrice, item.allocatedPurchaseCost, item.allocatedExtraCostShare, activeCosts)
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!salePrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      setSalePriceError("Enter a valid sale price")
      return
    }
    dispatch(
      markItemSold({
        itemId: item.id,
        salePrice: parsedPrice,
        saleCosts: activeCosts.map(({ category, label, amount }) => ({ category, label, amount })),
      }),
    )
    onClose()
  }

  return (
    <Modal title={`Mark "${item.name}" as Sold`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pricing reference */}
        <div className="grid grid-cols-2 gap-3">
          <CostCell label="Break-even" value={formatCurrency(item.breakEvenPrice)} colour="muted" />
          <CostCell label="Min. sale (15%)" value={formatCurrency(item.minSalePrice)} colour="warning" />
        </div>

        <Input
          label="Sale Price"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          prefix="£"
          value={salePrice}
          onChange={(e) => { setSalePrice(e.target.value); setSalePriceError("") }}
          error={salePriceError}
        />

        {/* Sale costs */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sale Costs
          </p>
          {draftCosts.map((cost) => (
            <div key={cost.tempId} className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{cost.label}</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={cost.amount === 0 ? "" : String(cost.amount)}
                onChange={(e) =>
                  setDraftCosts((prev) =>
                    prev.map((c) =>
                      c.tempId === cost.tempId
                        ? { ...c, amount: Number(e.target.value) || 0 }
                        : c,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>

        {/* Profit preview */}
        {previewProfit !== null && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Net profit</span>
            <ProfitValue value={previewProfit} />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" fullWidth>Confirm Sale</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export default memo(MarkSoldModal)
