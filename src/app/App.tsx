import { useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { CarsTab } from "./components/CarsTab";
import { RentalRequestsTab } from "./components/RentalRequestsTab";
import { Car } from "./components/CarFormDialog";
import { RentalRequest } from "./components/RentalFormDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { LogOut } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cars, setCars] = useState<Car[]>([
    {
      id: "1",
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      color: "Midnight Silver",
      status: "available",
      dailyRate: 89.99,
      mileage: 5420,
      licensePlate: "ABC-1234",
    },
    {
      id: "2",
      make: "BMW",
      model: "X5",
      year: 2023,
      color: "Alpine White",
      status: "rented",
      dailyRate: 129.99,
      mileage: 12500,
      licensePlate: "XYZ-5678",
    },
    {
      id: "3",
      make: "Mercedes-Benz",
      model: "E-Class",
      year: 2024,
      color: "Obsidian Black",
      status: "available",
      dailyRate: 139.99,
      mileage: 3200,
      licensePlate: "DEF-9012",
    },
    {
      id: "4",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      color: "Celestial Silver",
      status: "maintenance",
      dailyRate: 59.99,
      mileage: 18900,
      licensePlate: "GHI-3456",
    },
  ]);

  const [rentals, setRentals] = useState<RentalRequest[]>([
    {
      id: "1",
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      customerPhone: "+1 (555) 123-4567",
      carId: "1",
      carDetails: "Tesla Model 3 (ABC-1234)",
      startDate: "2024-12-25",
      endDate: "2024-12-30",
      status: "approved",
      notes: "Customer requested early pickup at 8 AM",
      totalCost: 449.95,
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "+1 (555) 987-6543",
      carId: "2",
      carDetails: "BMW X5 (XYZ-5678)",
      startDate: "2024-12-22",
      endDate: "2024-12-28",
      status: "pending",
      notes: "Business trip, requires GPS and car seat",
      totalCost: 779.94,
    },
    {
      id: "3",
      customerName: "Michael Brown",
      customerEmail: "m.brown@email.com",
      customerPhone: "+1 (555) 246-8135",
      carId: "3",
      carDetails: "Mercedes-Benz E-Class (DEF-9012)",
      startDate: "2024-12-20",
      endDate: "2024-12-23",
      status: "completed",
      notes: "Wedding event rental",
      totalCost: 419.97,
    },
  ]);

  const handleLogin = (username: string, password: string) => {
    // Simple mock authentication
    if (username && password) {
      setIsLoggedIn(true);
      toast.success("Welcome back! Successfully logged in.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("You have been logged out.");
  };

  const handleAddCar = (carData: Omit<Car, "id">) => {
    const newCar: Car = {
      ...carData,
      id: Date.now().toString(),
    };
    setCars([...cars, newCar]);
    toast.success(`${newCar.make} ${newCar.model} added successfully!`);
  };

  const handleUpdateCar = (updatedCar: Car) => {
    setCars(cars.map((car) => (car.id === updatedCar.id ? updatedCar : car)));
    toast.success(`${updatedCar.make} ${updatedCar.model} updated successfully!`);
  };

  const handleDeleteCar = (id: string) => {
    const car = cars.find((c) => c.id === id);
    setCars(cars.filter((car) => car.id !== id));
    if (car) {
      toast.success(`${car.make} ${car.model} deleted successfully!`);
    }
  };

  const handleAddRental = (rentalData: Omit<RentalRequest, "id">) => {
    const newRental: RentalRequest = {
      ...rentalData,
      id: Date.now().toString(),
    };
    setRentals([...rentals, newRental]);
    toast.success(`Rental request for ${newRental.customerName} created successfully!`);
  };

  const handleUpdateRental = (updatedRental: RentalRequest) => {
    setRentals(rentals.map((rental) => (rental.id === updatedRental.id ? updatedRental : rental)));
    toast.success(`Rental request for ${updatedRental.customerName} updated successfully!`);
  };

  const handleDeleteRental = (id: string) => {
    const rental = rentals.find((r) => r.id === id);
    setRentals(rentals.filter((rental) => rental.id !== id));
    if (rental) {
      toast.success(`Rental request for ${rental.customerName} deleted successfully!`);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Toaster position="top-right" />
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1>Car Rental Manager</h1>
            <p className="text-muted-foreground">Manage your fleet and rental requests</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cars">Cars ({cars.length})</TabsTrigger>
            <TabsTrigger value="rentals">Rental Requests ({rentals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="space-y-4">
            <CarsTab
              cars={cars}
              onAddCar={handleAddCar}
              onUpdateCar={handleUpdateCar}
              onDeleteCar={handleDeleteCar}
            />
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            <RentalRequestsTab
              rentals={rentals}
              cars={cars}
              onAddRental={handleAddRental}
              onUpdateRental={handleUpdateRental}
              onDeleteRental={handleDeleteRental}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
