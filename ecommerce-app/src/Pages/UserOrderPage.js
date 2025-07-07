import React from "react";

import { NavBar } from "../features/Navbar/NavBar";
import { UserOrders } from "../features/user/components/UserOrder";

export default function UserOrderPage() {
  return (
    <NavBar>
      <UserOrders />
    </NavBar>
  );
}
