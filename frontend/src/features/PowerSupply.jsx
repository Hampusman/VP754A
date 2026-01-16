import {useEffect, useState} from 'react';
import {getState, toggleState, setVoltage, setCurrent} from '../api/powerSupplyApi.js';
import '../styles/Instrument.css'
import '../styles/PowerSupply.css'

export default function PowerSupply() {
    const [psus, setPsus] = useState({
        upper: {
            isOn: false,
            voltage: '0',
            savedVoltage: '0',
            current: '0',
            savedCurrent: '0',
            busy: false
        }, lower: {
            isOn: false,
            voltage: '0',
            savedVoltage: '0',
            current: '0',
            savedCurrent: '0',
            busy: false
        },
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        getState('upper')
            .then(j => updatePsu('upper', {isOn: j.is_on}))
            .catch(e => setError(e));

        getState('lower')
            .then(j => updatePsu('lower', {isOn: j.is_on}))
            .catch(e => setError(e));
    }, []);


    function updatePsu(which, patch) {
        setPsus(prev => ({
            ...prev, [which]: {
                ...prev[which], ...patch,
            }
        }))
    }

    function onChangeVoltage(which, event) {
        updatePsu(which, {voltage: event.target.value});
    }

    async function onSetVoltage(which) {
        const voltage = psus[which].voltage;
        if (voltage === '') return;
        if (psus[which].busy) return;

        updatePsu(which, {busy: true});
        setError(null);

        try {
            const j = await setVoltage(which, {setpoint: Number(voltage)});
            updatePsu(which, {voltage: String(j.setpoint)});
            updatePsu(which, {savedVoltage: String(j.setpoint)});

        } catch (e) {
            setError(e);
        } finally {
            updatePsu(which, {busy: false});
        }
    }

    function onChangeCurrent(which, event) {
        updatePsu(which, {current: event.target.value});
    }

    async function onSetCurrent(which) {
        const current = psus[which].current;
        if (current === "") return;
        if (psus[which].busy) return;

        updatePsu(which, {busy: true});
        setError(null);

        try {
            const j = await setCurrent(which, {setpoint: Number(current)});
            updatePsu(which, {current: String(j.setpoint)});
            updatePsu(which, {savedCurrent: String(j.setpoint)});

        } catch (e) {
            setError(e);
        } finally {
            updatePsu(which, {busy: false});

        }
    }


    async function onToggle(which) {
        if (psus[which].busy) return;

        updatePsu(which, {busy: true});
        setError(null);

        try {
            const j = await toggleState(which);
            updatePsu(which, {isOn: j.is_on});
        } catch (e) {
            setError(e);
        } finally {
            updatePsu(which, {busy: false});
        }
    }


    return (
        <div className="power-supply">
            <div className="psu-upper">
                <div className="card">
                    <h3 className="title">Power Supply Upper</h3>
                    <div className="controls">
                        <div className="field">
                            <div><b>Static voltage: {psus.upper.savedVoltage}V</b></div>
                            <div className="label">
                                Output voltage (V)
                            </div>
                            <div className="input-row">
                                <input
                                    className="input"
                                    id="upper-voltage"
                                    value={psus.upper.voltage}
                                    onChange={(e) => onChangeVoltage('upper', e)}
                                    type="number"
                                    min={0}
                                    max={70}
                                    step={1}
                                />
                                <button onClick={() => onSetVoltage('upper')} disabled={psus.upper.busy}>
                                    {psus.upper.busy ? "..." : "Set voltage"}
                                </button>
                            </div>
                        </div>
                        <div className="field">
                            <div><b>Static current: {psus.upper.savedCurrent}A</b></div>
                            <div className="label">
                                Output current (A)
                            </div>
                            <div className="input-row">
                                <input
                                    className="input"
                                    id="upper-current"
                                    value={psus.upper.current}
                                    onChange={(e) => onChangeCurrent('upper', e)}
                                    type="number"
                                    min={0}
                                    max={450}
                                    step={10}
                                />
                                <button onClick={() => onSetCurrent('upper')} disabled={psus.upper.busy}>
                                    {psus.upper.busy ? "..." : "Set current"}
                                </button>
                            </div>
                        </div>
                        <div className="field">
                            <button onClick={() => onToggle('upper')} disabled={psus.upper.busy}>
                                {psus.upper.isOn ? "Turn On" : "Turn Off"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="psu-lower">
                <div className="card">
                    <h3 className="title"> Power Supply Lower</h3>
                    <div className="controls">
                        <div className="field">
                            <div><b>Static voltage: {psus.lower.savedVoltage}V</b></div>
                            <div className="label">
                                Output voltage (V)
                            </div>
                            <div className="input-row">
                                <input
                                    className="input"
                                    id="lower-voltage"
                                    value={psus.lower.voltage}
                                    onChange={(e) => onChangeVoltage('lower', e)}
                                    type="number"
                                    min={0}
                                    max={70}
                                    step={1}
                                />
                                <button onClick={() => onSetVoltage('lower')} disabled={psus.lower.busy}>
                                    {psus.lower.busy ? "..." : "Set voltage"}
                                </button>
                            </div>
                        </div>
                        <div className="field">
                            <div><b>Static current: {psus.lower.savedCurrent}A</b></div>
                            <div className="label">
                                Output current (A)
                            </div>
                            <div className="input-row">
                                <input
                                    className="input"
                                    id="lower-current"
                                    value={psus.lower.current}
                                    onChange={(e) => onChangeCurrent('lower', e)}
                                    type="number"
                                    min={0}
                                    max={450}
                                    step={10}
                                />
                                <button onClick={() => onSetCurrent('lower')} disabled={psus.lower.busy}>
                                    {psus.lower.busy ? "..." : "Set current"}
                                </button>
                            </div>
                        </div>
                        <div className="field">
                            <button onClick={() => onToggle('lower')} disabled={psus.lower.busy}>
                                {psus.lower.isOn ? "Turn On" : "Turn Off"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="error">
                {error && (<div className="error-text">
                    {error?.message ?? String(error)}
                </div>)}
            </div>
        </div>);
}
