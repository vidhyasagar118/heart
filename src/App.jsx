import { Routes, Route } from "react-router-dom";
import HeartForm from "./HeartForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HeartForm />} />
    </Routes>
  );
}

export default App;