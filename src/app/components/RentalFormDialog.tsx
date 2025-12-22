import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export interface RentalRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carId: string;
  carDetails: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes: string;
  totalCost: number;
}

interface RentalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental?: RentalRequest;
  onSave: (rental: Omit<RentalRequest, "id"> & { id?: string }) => void;
  availableCars: { id: string; label: string }[];
}

export function RentalFormDialog({
  open,
  onOpenChange,
  rental,
  onSave,
  availableCars,
}: RentalFormDialogProps) {
  const [formData, setFormData] = useState<Omit<RentalRequest, "id">>({
    customerName: rental?.customerName || "",
    customerEmail: rental?.customerEmail || "",
    customerPhone: rental?.customerPhone || "",
    carId: rental?.carId || "",
    carDetails: rental?.carDetails || "",
    startDate: rental?.startDate || "",
    endDate: rental?.endDate || "",
    status: rental?.status || "pending",
    notes: rental?.notes || "",
    totalCost: rental?.totalCost || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, ...(rental?.id ? { id: rental.id } : {}) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rental ? "Edit Rental Request" : "New Rental Request"}</DialogTitle>
          <DialogDescription>
            {rental ? "Update the rental details below" : "Fill in the rental request details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carId">Select Car</Label>
                <Select
                  value={formData.carId}
                  onValueChange={(value) => {
                    const car = availableCars.find(c => c.id === value);
                    setFormData({ 
                      ...formData, 
                      carId: value,
                      carDetails: car?.label || ""
                    });
                  }}
                >
                  <SelectTrigger id="carId">
                    <SelectValue placeholder="Choose a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: RentalRequest["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalCost">Total Cost ($)</Label>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this rental..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{rental ? "Update" : "Create"} Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
