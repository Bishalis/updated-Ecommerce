import React, { useEffect } from "react";
import { selectLoggedInUser, signOutAsync } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const LogOut = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  
  useEffect(() => {
    dispatch(signOutAsync());
  }, [dispatch]);
  
  // Show loading while logging out
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Logging out...</p>
        </div>
      </div>
    );
  }
  
  return <Navigate to="/login" replace={true} />;
};
