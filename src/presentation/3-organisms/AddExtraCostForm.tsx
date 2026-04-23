"use client"
import { FC, memo, useState } from "react"
import { useAppDispatch } from "../../store/hooks"
import { addBundleExtraCost } from "../../store/trackerSlice"
import type { CostCategory } from "../../types"
import Input from "../1-atoms/Input"
import Button from "../1-atoms/Button"
import Select from "../1-atoms/Select"
import { COST_CATEGORIES } from "../../config/constants"

interface Props {
  bundleId: string
  onClose: () => void
}

const AddExtraCostForm: FC<Props> = ({ bundleId, onClose }) => {
  const dispatch = useAppDispatch()
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState<CostCategory>("car_boot_entry")
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")

  const selectedHint = COST_CATEGORIES.find((c) => c.value === category)?.hint

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount")
      return
    }
    const autoLabel =
      label.trim() || COST_CATEGORIES.find((c) => c.value === category)?.label || "Extra cost"

    dispatch(
      addBundleExtraCost({
        bundleId,
        cost: { label: autoLabel, category, amount: Number(amount) },
      }),
    )
    onClose()
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 mt-4">
      <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white mb-4">
        Add Purchase Cost
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select
          label="Category"
          value={category}
          options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          hint={selectedHint}
          onChange={(e) => {
            setCategory(e.target.value as CostCategory)
            setLabel("")
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefix="£"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError("") }}
            error={amountError}
          />
          <Input
            label="Label (optional)"
            placeholder={COST_CATEGORIES.find((c) => c.value === category)?.label ?? ""}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm">Add Cost</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default memo(AddExtraCostForm)
