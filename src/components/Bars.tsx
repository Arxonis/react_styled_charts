import React, { use, useEffect, useRef, useState } from 'react';
import { motion, easeOut } from 'framer-motion';

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16);
  let g = (num >> 8) & 0x00FF;
  let b = num & 0x0000FF;

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  console.log(`Darkened barColor: rgb(${r}, ${g}, ${b})`);

  return `rgb(${r},${g},${b})`;
}

/**
 * Bar chart component
 *
 * @param {Object[]} data - The data for the bars (array of objects with `label` and `value`).
 * @param {number} width - Width of the chart in pixels.
 * @param {number} height - Height of the chart in pixels.
 * @param {string} barColor - Color of the bars ("e.g. #4d5394ff").
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
 * @param {number} barsSpacing - Spacing between bars.
 */

const Bars = ({ data, 
    width = 500,
    height = 300,
    barColor = "steelblue",
    showXaxis = false,
    showYaxis = false,
    strokeWidthAxe = 1,
    strokeColorAxe = "black",
    numberShownColumns = 5,
    initialValue = 0,
    xAxisLabelShow = false,
    yAxisLabelShow = false,
    xAxisLabel = "",
    yAxisLabel = "",
    paddingXaxis = 0,
    paddingYaxis = 0,
    ticksXShown = false,
    showLabelsTickX = false,
    barsSpacing = 2,
    animated = false
    }) => {
    const yLabelRef = useRef<SVGTextElement | null>(null);
    const [yLabelWidth, setYLabelWidth] = useState(0);

    const xLabelRef = useRef<SVGTextElement | null>(null);
    const [xLabelWidth, setXLabelWidth] = useState(0);

    const labelsTickXRefs = useRef<(SVGTextElement | null)[]>([]);
    const [labelsTickXHeight, setLabelsTickXHeight] = useState(0);

    const [hasMounted, setHasMounted] = useState(false);

    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        if (yAxisLabelShow && yLabelRef.current) {
            setYLabelWidth(yLabelRef.current.getBBox().width);
        }
    }, [yAxisLabelShow, yAxisLabel]);

    useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), (data.length > numberShownColumns) ? numberShownColumns * 100 : data.length * 125);
    return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (xAxisLabelShow && xLabelRef.current) {
            setXLabelWidth(xLabelRef.current.getBBox().height);
        }
    }, [xAxisLabelShow, xAxisLabel]);

    useEffect(() => {
    if (showLabelsTickX && labelsTickXRefs.current.length > 0) {
        const heights = labelsTickXRefs.current
        .filter((el): el is SVGTextElement => el !== null)
        .map(el => el.getBBox().height);
        for (const height of heights) {
            console.log(`Label tick X heightssssss: ${height}`);
        }
        setLabelsTickXHeight(Math.max(...heights));
    }
    }, [showLabelsTickX, data.length]);

    width = (width < 100) ? 100 : width; // Longueur du graphique
    height = (height < 100) ? 100 : height; // Hauteur du graphique
    data = data.filter((_, i) => i < numberShownColumns + initialValue && i >= initialValue); // Valeurs à afficher
    strokeWidthAxe = (strokeWidthAxe > 10) ? 10 : strokeWidthAxe;

    const maxValue = Math.max(...data.filter((_, i) => i < numberShownColumns).map(d => d.value)); // Valeur maximale pour normaliser les barres
    const barWidth = width / Math.min(numberShownColumns, data.length); // Largeur de chaque barre
    barsSpacing = (barsSpacing < 0) ? 0 : (barsSpacing > barWidth ? barWidth - 2 : barsSpacing);

    const effectivePaddingY = (yAxisLabelShow ? yLabelWidth : 0); // Espace pour le label de l'axe Y
    const effectivePaddingX = (xAxisLabelShow ? xLabelWidth : 0) + (showLabelsTickX ? labelsTickXHeight : 0); // Espace pour le label de l'axe X

    return (
        <svg width={width + 2 * paddingXaxis + strokeWidthAxe + effectivePaddingY + barsSpacing} height={height + 2 * paddingYaxis + strokeWidthAxe + effectivePaddingX}>
            {data.filter((_, i) => i < numberShownColumns).map((d, i) => {
            const barHeight = (d.value / maxValue) * height;
            const barY = height - barHeight + paddingYaxis - strokeWidthAxe / 2;

            const variants = {
                rest: {
                y: barY,
                height: barHeight,
                fill: barColor,
                transition: {
                    fill: {
                        duration: hasMounted ? 0.25 : 1,
                        delay: hasMounted ? 0 : 0.05 * i + data.length * 0.075,
                    },
                    y: { duration: 1 * (d.value / maxValue), delay: i * 0.1, ease: easeOut },
                    height: { duration: 1 * (d.value / maxValue), delay: i * 0.1, ease: easeOut },
                    },
                },
                hover: {
                fill: "#000000",
                transition: { fill: { duration: 0 } },
                },
                initial: {
                y: height + paddingYaxis,
                height: 0,
                fill: darkenColor(barColor, 0.7),
                },
            };

            return (
                <motion.rect
                key={i}
                x={i * barWidth + effectivePaddingY + paddingXaxis + strokeWidthAxe + barsSpacing}
                width={barWidth - barsSpacing}
                rx={(barWidth - barsSpacing) ** 0.5}
                ry={(barWidth - barsSpacing) ** 0.5}
                variants={variants}
                initial={animated ? "initial" : false}
                animate="rest"
                whileHover={(hasMounted) ? "hover" : undefined}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                />
            );
            })}

            {showXaxis && (
                <line
                    x1={strokeWidthAxe / 2 + effectivePaddingY + paddingXaxis}
                    y1={height + paddingYaxis}
                    x2={width + effectivePaddingY + paddingXaxis + strokeWidthAxe}
                    y2={height + paddingYaxis}
                    stroke={strokeColorAxe}
                    strokeWidth={strokeWidthAxe}
                />
            )}
            {showYaxis && (
                <line
                    x1={strokeWidthAxe / 2 + effectivePaddingY + paddingXaxis}
                    y1={paddingYaxis}
                    x2={strokeWidthAxe / 2 + effectivePaddingY + paddingXaxis}
                    y2={height + paddingYaxis + strokeWidthAxe / 2}
                    stroke={strokeColorAxe}
                    strokeWidth={strokeWidthAxe}
                />
            )}
            {xAxisLabelShow && (
                <text
                    ref={xLabelRef}
                    x={width / 2 + paddingXaxis + effectivePaddingY}
                    y={height + paddingYaxis + 35 + strokeWidthAxe + labelsTickXHeight}
                    textAnchor="middle"
                    fontSize={width / 30 < 12 ? 12 : width / 30}
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
                    fontSize={width / 30 < 12 ? 12 : width / 30}
                >
                    {yAxisLabel}
                </text>
            )}
            {ticksXShown && data.filter((_, i) => i < numberShownColumns).map((d, i) => (
                <line
                    key={i}
                    x1={i * barWidth + effectivePaddingY + paddingXaxis + (barWidth - barsSpacing) / 2 + strokeWidthAxe + barsSpacing}
                    y1={height + paddingYaxis}
                    x2={i * barWidth + effectivePaddingY + paddingXaxis + (barWidth - barsSpacing) / 2 + strokeWidthAxe + barsSpacing}
                    y2={height + paddingYaxis + 5}
                    stroke={strokeColorAxe}
                    strokeWidth={strokeWidthAxe}
                />
            ))}

            {showLabelsTickX && data.filter((_, i) => i < numberShownColumns).map((d, i) => (
                <text
                    ref={el => {labelsTickXRefs.current[i] = el;}}
                    key={i}
                    x={i * barWidth + effectivePaddingY + paddingXaxis + (barWidth - barsSpacing) / 2 + strokeWidthAxe + barsSpacing}
                    y={height + paddingYaxis + labelsTickXHeight + 5}
                    textAnchor="middle"
                    fontSize={width / (numberShownColumns < data.length ? numberShownColumns : data.length) > 14 ? 14 : width / (numberShownColumns < data.length ? numberShownColumns : data.length)}
                    fill="#000000ff"
                >
                    {d.label}
                </text>
            ))}

            {hoveredIndex !== null && hasMounted && (() => {
            const d = data[hoveredIndex];
            const barWidth = width / Math.min(numberShownColumns, data.length);
            const barHeight = (d.value / maxValue) * height;
            const barX = hoveredIndex * barWidth + effectivePaddingY + paddingXaxis + strokeWidthAxe + barsSpacing;
            const barY = height - barHeight + paddingYaxis - strokeWidthAxe / 2;

            const tooltipWidth = 80;
            const tooltipHeight = 30;
            const tooltipX = barX + (barWidth - barsSpacing) / 2 - tooltipWidth / 2;
            const tooltipY = barY - tooltipHeight - 10;

            return (
                <g>
                <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    fill="black"
                    rx={5}
                    ry={5}
                    opacity={1}
                />
                <rect
                    x={tooltipX + 0.5}
                    y={tooltipY + 0.5}
                    width={tooltipWidth - 1}
                    height={tooltipHeight - 1}
                    fill="white"
                    rx={5}
                    ry={5}
                    opacity={1}
                />
                <text
                    x={tooltipX + tooltipWidth / 2}
                    y={tooltipY + tooltipHeight / 2 + 5}
                    textAnchor="middle"
                    fill="black"
                    fontSize={12}
                >
                    {`${d.label}: ${d.value}`}
                </text>
                </g>
            );
            })()}


        </svg>
    );
    }

export default Bars;