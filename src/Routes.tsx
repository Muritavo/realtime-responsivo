import App from "./App";
import Config from "./Config";

export default function Routes() {
  return window.location.pathname.includes("/config") ? <Config /> : <App />;
}
