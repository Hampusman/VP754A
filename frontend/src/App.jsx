import PowerSupply from "./features/PowerSupply.jsx";
import DataFeed from "./features/DataFeed.jsx";

import './styles/App.css'

export default function App() {
    return (
        <div className="app">
            <h2>VP754A Dashboard</h2>
            <div className="dashboard">
                <PowerSupply/>
                <DataFeed/>
            </div>
        </div>);
}
