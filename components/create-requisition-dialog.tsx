"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRequisitions } from "@/lib/requisition-context"
import { useToast } from "@/hooks/use-toast"
import type { RouterType } from "@/lib/types"

interface CreateRequisitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const routerTypes: RouterType[] = ["Cisco ISR 4000", "Cisco ASR 1000", "Juniper MX Series", "Mikrotik", "Other"]

export function CreateRequisitionDialog({ open, onOpenChange }: CreateRequisitionDialogProps) {
  const { createRequisition } = useRequisitions()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    routerType: "" as RouterType,
    quantity: 1,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.routerType) {
      toast({
        title: "Error",
        description: "Please select a router type",
        variant: "destructive",
      })
      return
    }

    if (formData.quantity < 1) {
      toast({
        title: "Error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      })
      return
    }

    createRequisition({
      routerType: formData.routerType,
      quantity: formData.quantity,
      notes: formData.notes,
      status: "pending",
    })

    toast({
      title: "Requisition Created",
      description: "Your requisition has been submitted successfully",
    })

    // Reset form
    setFormData({
      routerType: "" as RouterType,
      quantity: 1,
      notes: "",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Requisition</DialogTitle>
          <DialogDescription>Fill out the form below to submit a new equipment requisition</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routerType">Router Type</Label>
            <Select
              value={formData.routerType}
              onValueChange={(value) => setFormData({ ...formData, routerType: value as RouterType })}
            >
              <SelectTrigger id="routerType">
                <SelectValue placeholder="Select router type" />
              </SelectTrigger>
              <SelectContent>
                {routerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information or requirements..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Requisition</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
