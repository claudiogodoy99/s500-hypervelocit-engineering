import { Route, Routes } from "react-router-dom";
import { EntryPage } from "@/pages/EntryPage";
import { GamePage } from "@/pages/GamePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/game/:gameId" element={<GamePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
