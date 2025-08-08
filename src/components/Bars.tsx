import React, { use, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Bar chart component
 *
 * @param {Object[]} data - The data for the bars (array of objects with `label` and `value`).
 * @param {number} width - Width of the chart in pixels.
 * @param {number} height - Height of the chart in pixels.
 * @param {string} color - Color of the bars ("e.g. #4d5394ff").
 * @param {boolean} showXaxis - Whether to show the X axis line.
 * @param {boolean} showYaxis - Whether to show the Y axis line.
 * @param {number} strokeWidth - Width of axis lines.
 * @param {string} strokeColor - Color of axis lines.
 * @param {number} numberShown - Number of bars to show at once.
 * @param {number} initialValue - Index of the first bar to display.
 * @param {boolean} xAxisLabelShow - Whether to show X axis label.
 * @param {boolean} yAxisLabelShow - Whether to show Y axis label.
 * @param {string} xAxisLabel - Text for the X axis label.
 * @param {string} yAxisLabel - Text for the Y axis label.
 * @param {number} paddingXaxis - Padding on the X axis.
 * @param {number} paddingYaxis - Padding on the Y axis.
 * @param {boolean} ticksShown - Whether to show ticks on the X axis.
 */
const Bars = ({ data, 
    width = 500,
    height = 300,
    color = "steelblue",
    showXaxis = false,
    showYaxis = false,
    strokeWidth = 1,
    strokeColor = "black",
    numberShown = 5,
    initialValue = 0,
    xAxisLabelShow = false,
    yAxisLabelShow = false,
    xAxisLabel = "",
    yAxisLabel = "",
    paddingXaxis = 0,
    paddingYaxis = 0,
    ticksXShown = false,
    }) => {
    const yLabelRef = useRef<SVGTextElement | null>(null);
    const [yLabelWidth, setYLabelWidth] = useState(0);

    const xLabelRef = useRef<SVGTextElement | null>(null);
    const [xLabelWidth, setXLabelWidth] = useState(0);

    useEffect(() => {
        if (yAxisLabelShow && yLabelRef.current) {
            setYLabelWidth(yLabelRef.current.getBBox().width);
        }
    }, [yAxisLabelShow, yAxisLabel]);

    useEffect(() => {
        if (xAxisLabelShow && xLabelRef.current) {
            setXLabelWidth(xLabelRef.current.getBBox().height);
        }
    }, [xAxisLabelShow, xAxisLabel]);

    width = (width < 100) ? 100 : width; // Longueur du graphique
    height = (height < 100) ? 100 : height; // Hauteur du graphique
    data = data.filter((_, i) => i < numberShown + initialValue && i >= initialValue); // Valeurs à afficher
    strokeWidth = (strokeWidth > 10) ? 10 : strokeWidth;

    const maxValue = Math.max(...data.filter((_, i) => i < numberShown).map(d => d.value)); // Valeur maximale pour normaliser les barres
    const barWidth = width / Math.min(numberShown, data.length); // Largeur de chaque barre

    const effectivePaddingY = (yAxisLabelShow ? yLabelWidth : 0); // Espace pour le label de l'axe Y
    const effectivePaddingX = (xAxisLabelShow ? xLabelWidth : 0); // Espace pour le label de l'axe X

    return (
        <svg width={width + 2 * paddingXaxis + strokeWidth + effectivePaddingY} height={height + 2 * paddingYaxis + strokeWidth + effectivePaddingX}>
            {data.filter((_, i) => i < numberShown).map((d, i) => (
                <motion.rect
                key={i}
                x={i * barWidth + effectivePaddingY + paddingXaxis + strokeWidth}
                width={barWidth - 2}
                rx={5}
                ry={8}
                initial={{
                    y: height + paddingYaxis,
                    height: 0,
                    fill: "#000000"
                }}
                animate={{
                    y: height - (d.value / maxValue) * height + paddingYaxis - strokeWidth / 2,
                    height: (d.value / maxValue) * height,
                    fill: color
                }}
                transition={{
                    duration: 1 * d.value / maxValue,
                    delay: i * 0.1,
                    ease: "easeOut",
                    fill: { duration: 1, delay : 0.15 * i }
                }}
                whileHover={{
                    fill: "orange"
                }}
                />
            ))}
            {showXaxis && (
                <line
                    x1={strokeWidth / 2 + effectivePaddingY + paddingXaxis}
                    y1={height + paddingYaxis}
                    x2={width + effectivePaddingY + paddingXaxis + strokeWidth}
                    y2={height + paddingYaxis}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            )}
            {showYaxis && (
                <line
                    x1={strokeWidth / 2 + effectivePaddingY + paddingXaxis}
                    y1={paddingYaxis}
                    x2={strokeWidth / 2 + effectivePaddingY + paddingXaxis}
                    y2={height + paddingYaxis + strokeWidth / 2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            )}
            {xAxisLabelShow && (
                <text
                    ref={xLabelRef}
                    x={width / 2 + paddingXaxis + effectivePaddingY}
                    y={height + paddingYaxis + 20 + strokeWidth}
                    textAnchor="middle"
                    fontSize="12"
                >
                    {xAxisLabel}
                </text>
            )}
            {yAxisLabelShow && (
                <text
                    ref={yLabelRef}
                    x={-paddingYaxis - effectivePaddingY}
                    y={paddingXaxis + effectivePaddingX}
                    transform="rotate(-90)"
                    textAnchor="middle"
                    fontSize="12"
                >
                    {yAxisLabel}
                </text>
            )}
            {ticksXShown && data.filter((_, i) => i < numberShown).map((d, i) => (
                <line
                    key={i}
                    x1={i * barWidth + effectivePaddingY + paddingXaxis + barWidth / 2}
                    y1={height + paddingYaxis}
                    x2={i * barWidth + effectivePaddingY + paddingXaxis + barWidth / 2}
                    y2={height + paddingYaxis + 5}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            ))}

        </svg>
    );
    }

export default Bars;