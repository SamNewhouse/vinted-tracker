import { FC, memo, useState } from "react"
import type { DraftItem } from "../../types"
import Button from "../1-atoms/Button"
import Input from "../1-atoms/Input"

interface Props {
  items: DraftItem[]
  error?: string
  onAdd: (item: DraftItem) => void
  onRemove: (tempId: string) => void
}

const DraftItemList: FC<Props> = ({ items, error, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [nameError, setNameError] = useState("")

  const handleAdd = () => {
    if (!name.trim()) { setNameError("Item name is required"); return }
    onAdd({ tempId: `${Date.now()}-${Math.random()}`, name: name.trim(), description: description.trim() || undefined })
    setName("")
    setDescription("")
    setNameError("")
    setShowForm(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Items
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Purchase cost splits equally across all items
          </p>
        </div>
        {!showForm && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(true)}>
            + Add
          </Button>
        )}
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-red-500">{error}</p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => (
            <li key={item.tempId} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                {item.description && (
                  <span className="ml-2 text-xs text-slate-400">{item.description}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.tempId)}
                className="text-slate-400 hover:text-red-500 transition-colors text-xs"
                aria-label="Remove item"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Input
            label="Item Name"
            placeholder="e.g. Nike Air Max 90"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError("") }}
            error={nameError}
          />
          <Input
            label="Description (optional)"
            placeholder="e.g. Size 10, worn twice"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd}>Add Item</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setNameError("") }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(DraftItemList)
