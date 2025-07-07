import React from "react";

import { NavBar } from "../features/Navbar/NavBar";
import { UserProfile } from "../features/user/components/UserProfile";

export default function UserProfilePage() {
  return (
    <NavBar>
      <UserProfile />
    </NavBar>
  );
}
