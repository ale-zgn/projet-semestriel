import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { RentalRequest, RentalFormDialog } from "./RentalFormDialog";
import { Car } from "./CarFormDialog";
import { Plus, MoreVertical, Search, Filter, Calendar, User, Mail, Phone } from "lucide-react";

interface RentalRequestsTabProps {
  rentals: RentalRequest[];
  cars: Car[];
  onAddRental: (rental: Omit<RentalRequest, "id">) => void;
  onUpdateRental: (rental: RentalRequest) => void;
  onDeleteRental: (id: string) => void;
}

export function RentalRequestsTab({
  rentals,
  cars,
  onAddRental,
  onUpdateRental,
  onDeleteRental,
}: RentalRequestsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalRequest | undefined>();
  const [deleteRentalId, setDeleteRentalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const availableCars = cars.map((car) => ({
    id: car.id,
    label: `${car.make} ${car.model} (${car.licensePlate})`,
  }));

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      rental.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.carDetails.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (rentalData: Omit<RentalRequest, "id"> & { id?: string }) => {
    if (rentalData.id) {
      onUpdateRental(rentalData as RentalRequest);
    } else {
      onAddRental(rentalData);
    }
    setEditingRental(undefined);
  };

  const handleEdit = (rental: RentalRequest) => {
    setEditingRental(rental);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteRentalId) {
      onDeleteRental(deleteRentalId);
      setDeleteRentalId(null);
    }
  };

  const getStatusColor = (status: RentalRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2>Rental Requests</h2>
          <p className="text-muted-foreground">Manage customer rental requests</p>
        </div>
        <Button
          onClick={() => {
            setEditingRental(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRentals.map((rental) => (
          <Card key={rental.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{rental.customerName}</CardTitle>
                  <CardDescription>{rental.carDetails}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(rental)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteRentalId(rental.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span className="truncate">{rental.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>{rental.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>
                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className={getStatusColor(rental.status)}>
                  {rental.status}
                </Badge>
                <span>${rental.totalCost.toFixed(2)}</span>
              </div>
              {rental.notes && (
                <p className="text-muted-foreground line-clamp-2 pt-2 border-t">
                  {rental.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRentals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== "all"
                ? "No rental requests found matching your filters"
                : "No rental requests yet. Click 'New Request' to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      <RentalFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rental={editingRental}
        onSave={handleSave}
        availableCars={availableCars}
      />

      <AlertDialog open={deleteRentalId !== null} onOpenChange={() => setDeleteRentalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the rental request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
