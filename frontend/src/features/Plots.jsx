import {useEffect, useMemo, useState} from 'react';
import '../styles/DataFeed.css';
import '../styles/Plots.css'


export function MultiLinePlot({
                                  title = "Multi Line plot", series, yMin, yMax, maxPoints = 400, height = 160,
                              }) {
    const [samples, setSamples] = useState([]);
    const sampleKey = useMemo(() => {
        return series
            .map((s) => {
                const n = Number(s.value);
                return Number.isFinite(n) ? n.toFixed(6) : 'NaN';
            })
            .join("|");
    }, [series]);
    useEffect(() => {
        const row = {};
        let anyFinite = false;
        for (const s of series) {
            const n = Number(s.value);
            if (Number.isFinite(n)) {
                row[s.id] = n;
                anyFinite = true;
            } else {
                row[s.id] = null;
            }
        }
        if (!anyFinite) return;
        setSamples((prev) => {
            const next = prev.length >= maxPoints ? prev.slice(prev.length - maxPoints + 1) : prev.slice();
            next.push(row);
            return next;
        });
    }, [sampleKey, series, maxPoints]);
    const dims = useMemo(() => {
        const w = 600;
        const h = height;
        const padL = 54;
        const padR = 12;
        const padT = 18;
        const padB = 22;
        return {
            w, h, padL, padR, padT, padB, innerW: w - padL - padR, innerH: h - padT - padB,
        };
    }, [height]);
    const yDomain = useMemo(() => {
        const min = Number(yMin);
        const max = Number(yMax);
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
            return {min: 0, max: 1};
        }
        return {min, max};
    }, [yMin, yMax]);

    function xPx(i, n) {
        if (n < 2) return dims.padL;
        const xn = i / (n - 1);
        return dims.padL + xn * dims.innerW;
    }

    function yPx(y) {
        const yn = (y - yDomain.min) / (yDomain.max - yDomain.min);
        return dims.padT + (1 - yn) * dims.innerH;
    }

    function buildPolyline(seriesId) {
        const n = samples.length;
        if (n < 2) return '';

        const pts = [];
        for (let i = 0; i < n; i++) {
            const y = samples[i][seriesId];
            if (y == null) continue;
            const x = xPx(i, n);
            const yy = yPx(y);
            pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
        }
        return pts.join(" ");
    }

    const yTicks = useMemo(() => {
        const ticks = 5;
        const out = [];
        for (let i = 0; i < ticks; i++) {
            const a = i / (ticks - 1);
            const y = yDomain.min + a * (yDomain.max - yDomain.min);
            out.push({y, py: yPx(y)});
        }
        return out;
    }, [yDomain, dims]);
    useMemo(() => {
        if (samples.length === 0) return null;
        const last = samples[samples.length - 1];
        return series.map((s) => {
            const v = last[s.id];
            return {id: s.id, label: s.label, v};
        });
    }, [samples, series]);
    const opacities = [0.95, 0.70, 0.50, 0.35, 0.25, 0.18];
    return (<div className="card">
        <div className="header">
            <div className="title">{title}</div>
        </div>
        <div className="plot-ids">
            {series.map((s, i) => (<div className="plot-ids-line-placement" key={s.id}>
                <span className="plot-ids-line" style={{background: s.color}}/>
                <span>{s.label}</span>
            </div>))}
        </div>
        <svg
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            width="100%"
            height={height}
            style={{display: "block", marginTop: 8}}>
            {yTicks.map((t, idx) => (<g key={idx}>
                <line
                    x1={dims.padL}
                    y1={t.py}
                    x2={dims.w - dims.padR}
                    y2={t.py}
                    stroke="currentColor"
                    opacity="0.10"
                />
                <text
                    x={dims.padL - 8}
                    y={t.py + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="currentColor"
                    opacity="0.65"
                >
                    {t.y.toFixed(2)}
                </text>
            </g>))}
            <rect
                x={dims.padL}
                y={dims.padT}
                width={dims.innerW}
                height={dims.innerH}
                fill="none"
                stroke="currentColor"
                opacity="0.18"
            />
            {series.map((s, i) => {
                const pts = buildPolyline(s.id);
                if (!pts) return null;
                return (<polyline
                    key={s.id}
                    fill="none"
                    stroke={s.color ?? "currentColor"}
                    strokeWidth="2"
                    opacity={opacities[i % opacities.length]}
                    points={pts}
                />);
            })}
            {samples.length < 2 && (<text x={dims.padL + 8} y={dims.padT + 20} fill="currentColor" opacity="0.6">
                Waiting for samples…
            </text>)}
        </svg>
    </div>);
}

export function LinearPlot({
                               title = "Linear plot",
                               k,
                               m,
                               xMin,
                               xMax,
                               yMin,
                               yMax,
                               points = 200,
                               unit = "",
                               height = 160,
                               color = "currentColor",
                           }) {
    const [samples, setSamples] = useState([]);
    useEffect(() => {
        if (k === '' || m === '') {
            setSamples([])
            return;
        }
        const K = Number(k);
        const M = Number(m);
        if (!Number.isFinite(K) || !Number.isFinite(M)) {
            setSamples([]);
            return;
        }
        const N = Math.max(2, Math.floor(points));
        const step = (xMax - xMin) / (N - 1);
        const ys = [];
        for (let i = 0; i < N; i++) {
            const x = xMin + i * step;
            ys.push(K * x + M);
        }
        setSamples(ys);
    }, [k, m, xMin, xMax, points]);
    const dims = useMemo(() => {
        const w = 600;
        const h = height;
        const padL = 54;
        const padR = 12;
        const padT = 18;
        const padB = 22;
        return {w, h, padL, padR, padT, padB, innerW: w - padL - padR, innerH: h - padT - padB};
    }, [height]);
    const yDomain = useMemo(() => {
        const minIn = Number(yMin);
        const maxIn = Number(yMax);
        if (Number.isFinite(minIn) && Number.isFinite(maxIn) && minIn !== maxIn) {
            return {min: minIn, max: maxIn};
        }
        let min = Infinity;
        let max = -Infinity;
        for (const y of samples) {
            if (!Number.isFinite(y)) continue;
            if (y < min) min = y;
            if (y > max) max = y;
        }
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
            return {min: 0, max: 1};
        }
        const pad = (max - min) * 0.05;
        return {min: min - pad, max: max + pad};
    }, [yMin, yMax, samples]);

    function xPx(i, n) {
        if (n < 2) return dims.padL;
        const xn = i / (n - 1);
        return dims.padL + xn * dims.innerW;
    }

    function xPxFromValue(x) {
        const xn = (x - xMin) / (xMax - xMin);
        return dims.padL + xn * dims.innerW;
    }

    function yPx(y) {
        const yn = (y - yDomain.min) / (yDomain.max - yDomain.min);
        return dims.padT + (1 - yn) * dims.innerH;
    }

    const polylinePoints = useMemo(() => {
        const n = samples.length;
        if (n < 2) return "";
        const pts = [];
        for (let i = 0; i < n; i++) {
            const y = samples[i];
            if (!Number.isFinite(y)) continue;
            const x = xPx(i, n);
            const yy = yPx(y);
            pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
        }
        return pts.join(" ");
    }, [samples, yDomain, dims]);
    const yTicks = useMemo(() => {
        const ticks = 5;
        const out = [];
        for (let i = 0; i < ticks; i++) {
            const a = i / (ticks - 1);
            const y = yDomain.min + a * (yDomain.max - yDomain.min);
            out.push({y, py: yPx(y)});
        }
        return out;
    }, [yDomain, dims]);
    const xTicks = useMemo(() => {
        const ticks = 6; // 5–7 is usually nice
        const out = [];
        for (let i = 0; i < ticks; i++) {
            const a = i / (ticks - 1);
            const x = xMin + a * (xMax - xMin);
            out.push({x, px: xPxFromValue(x)});
        }
        return out;
    }, [xMin, xMax, dims]);

    const K = Number(k);
    const M = Number(m);
    return (<div className="card">
        <div className="header">
            <div className="title">
                {title} {unit ? `(${unit})` : ""}
            </div>
            <div className="coefficients">
                {Number.isFinite(K) && Number.isFinite(M) ? (<>
                    k={K.toFixed(4)} &nbsp; m={M.toFixed(4)}
                </>) : ("k/m not valid")}
            </div>
        </div>
        <div className="function">
            <span className="function-line" style={{background: color}}/>
            <span>y = kx + m</span>
        </div>
        <svg viewBox={`0 0 ${dims.w} ${dims.h}`} width="100%" height={height}
             style={{display: "block", marginTop: 8}}>
            {yTicks.map((t, idx) => (<g key={idx}>
                <line
                    x1={dims.padL}
                    y1={t.py}
                    x2={dims.w - dims.padR}
                    y2={t.py}
                    stroke="currentColor"
                    opacity="0.10"
                />
                <text
                    x={dims.padL - 8}
                    y={t.py + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="currentColor"
                    opacity="0.65"
                >
                    {t.y.toFixed(2)}
                </text>
            </g>))}
            {xTicks.map((t, idx) => (<g key={idx}>
                    <line
                        x1={t.px}
                        y1={dims.padT}
                        x2={t.px}
                        y2={dims.h - dims.padB}
                        stroke="currentColor"
                        opacity="0.10"
                    />
                    <text
                        x={t.px}
                        y={dims.h - 6}
                        textAnchor="middle"
                        fontSize="12"
                        fill="currentColor"
                        opacity="0.65"
                    >
                        {t.x.toFixed(2)}
                    </text>
                </g>))}
            <rect
                x={dims.padL}
                y={dims.padT}
                width={dims.innerW}
                height={dims.innerH}
                fill="none"
                stroke="currentColor"
                opacity="0.18"
            />
            {polylinePoints ? (<polyline fill="none" stroke={color} strokeWidth="2" points={polylinePoints}/>) : (
                <text x={dims.padL + 8} y={dims.padT + 20} fill="currentColor" opacity="0.6">
                    Waiting for data...
                </text>)}
        </svg>
    </div>);
}
