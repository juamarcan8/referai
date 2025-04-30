import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { JSX } from "react";

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/" /> : children;
};
