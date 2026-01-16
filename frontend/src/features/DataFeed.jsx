import {useDataSnapshot} from '../hooks/useSnapshot.js';
import PwaCard from './PowerAnalyzerData.jsx';
import ArduinoCard from './ArduinoData.jsx';
import {LinearPlot, MultiLinePlot} from './Plots.jsx';
import Calibrate from "./Calibration.jsx";


export default function DataFeed() {
    const {values} = useDataSnapshot(50);
    return (<div className="data-feed">
        <div className="pwa">
            <PwaCard pwa={values.pwa}/>
            <div style={{marginTop: 12, display: "grid", gap: 12}}>
                <MultiLinePlot
                    title="PWA Currents"
                    unit="A"
                    yMin={0}
                    yMax={100}
                    maxPoints={400}
                    series={[
                        {id: "c1", label: "Ch1", value: values.pwa.channel1.current, color: "#3b82f6"},
                        {id: "c2", label: "Ch2", value: values.pwa.channel2.current, color: "#ef4444"},
                        {id: "c3", label: "Ch3", value: values.pwa.channel3.current, color: "#22c55e"},
                        {id: "c4", label: "Ch4", value: values.pwa.channel4.current, color: "#a855f7"},
                    ]}
                />
            </div>
        </div>
        <div className="arduino">
            <ArduinoCard arduino={values.arduino.channels}/>
            <div style={{marginTop: 12}}>
                <MultiLinePlot
                    title="Arduino Voltages"
                    unit="V"
                    yMin={2}
                    yMax={3}
                    maxPoints={400}
                    series={[
                        {id: "c1", label: "Ch1", value: values.arduino.channels.channel1.voltage, color: "#3b82f6"},
                        {id: "c2", label: "Ch2", value: values.arduino.channels.channel2.voltage, color: "#ef4444"},]}
                />
            </div>
        </div>
        <div className="calibration-line">
            <LinearPlot
                title="Linear regression"
                k={values.arduino.calibration.k}
                m={values.arduino.calibration.m}
                xMin={0}
                xMax={100}
                yMin={2.25}
                yMax={2.55}
                color="#22c55e"
            />
        </div>
        <div className="calibration">
            <Calibrate/>
        </div>
    </div>);
}
