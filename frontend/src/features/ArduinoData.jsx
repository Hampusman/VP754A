import '../styles/Instrument.css';
import '../styles/DataFeed.css';

export default function ArduinoData({arduino}) {
    return (
        <div className="arduino">
            <div className="card">
                <h3 className="title">Arduino</h3>
                <div className="channel-grid">
                    {Object.entries(arduino).map(([name, channel]) => {
                        const voltage = Number(channel.voltage);
                        const current = Number(channel.current);
                        return (
                            <div key={name} className="channel-card">
                                <div className="channel-name">{name}</div>
                                <div>V: <b>{Number.isFinite(voltage) ? `${voltage.toFixed(3)} V` : "-"}</b></div>
                                <div>I: <b>{Number.isFinite(current) ? `${current.toFixed(3)} A` : "-"}</b></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
