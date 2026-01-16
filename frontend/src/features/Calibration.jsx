import {getCalibration} from '../api/calibrateApi.js';
import {useState} from 'react';
import '../styles/Calibration.css';

export default function Calibrate() {
    const [busy, setBusy] = useState(false);
    const [saveFile, setSaveFile] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(null);

    async function onCalibrate() {
        if (busy) return;
        setBusy(true);
        setMsg('');
        try {
            await getCalibration(saveFile);
            setMsg('Triggered!');
            setError(null)
        } catch (e) {
            setError(e);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="calibration">
            <div className="card">
                <h3 className="title">Calibration</h3>
                <div className="calibrate-button">
                    <button onClick={onCalibrate} disabled={busy}>
                        {busy ? "Calibrating…" : "Calibrate"}
                    </button>
                    <label className="save-to-file">
                        Save measurement:
                        <input
                            type="checkbox"
                            checked={saveFile}
                            onChange={() => setSaveFile(prev => !prev)}
                        />
                    </label>
                </div>
            </div>
            <div className="error">
                {error && (<div className="error-text">
                    {error?.message ?? String(error)}
                </div>)}
            </div>
        </div>
    );
}
