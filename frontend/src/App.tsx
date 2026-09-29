import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/router";
import { ThemeControllerDrawer } from "@/components/theme-controller-drawer";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ThemeControllerDrawer trigger="floating" />
    </>
  );
}

export default App;
