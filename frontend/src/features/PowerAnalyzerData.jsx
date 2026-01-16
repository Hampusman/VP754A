import '../styles/Instrument.css';
import '../styles/DataFeed.css';

export default function PowerAnalyzerData({pwa}) {
    return (
        <div className="pwa">
            <div className="card">
                <h3 className="title">Power Analyzer</h3>
                <div className="channel-grid">
                    {Object.entries(pwa).map(([name, channel]) => {
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