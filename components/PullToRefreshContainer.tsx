import React, { useState, useRef, TouchEvent, MouseEvent } from 'react';
import RefreshIcon from './RefreshIcon';

interface PullToRefreshContainerProps {
    onRefresh: () => Promise<any>;
    children: React.ReactNode;
    className?: string;
}

const PULL_THRESHOLD = 85; // Distance in pixels to trigger refresh

const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({ onRefresh, children, className }) => {
    const [pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);

    const handleStart = (y: number) => {
        if (containerRef.current && containerRef.current.scrollTop === 0 && !refreshing) {
            setPulling(true);
            startY.current = y;
        }
    };

    const handleMove = (y: number) => {
        if (!pulling || refreshing) return;

        const distance = Math.max(0, y - startY.current);
        setPullDistance(distance);
    };

    const handleEnd = () => {
        if (!pulling || refreshing) return;

        setPulling(false);
        if (pullDistance > PULL_THRESHOLD) {
            setRefreshing(true);
            setPullDistance(PULL_THRESHOLD); // Lock the indicator in place
            onRefresh().finally(() => {
                // Animate out
                setPullDistance(0);
                setTimeout(() => setRefreshing(false), 200);
            });
        } else {
            setPullDistance(0);
        }
    };

    // Touch events
    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => handleStart(e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent<HTMLDivElement>) => handleMove(e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    // Mouse events for desktop testing
    const onMouseDown = (e: MouseEvent<HTMLDivElement>) => handleStart(e.clientY);
    const onMouseMove = (e: MouseEvent<HTMLDivElement>) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => handleEnd(); // If mouse leaves the area

    const indicatorStyle = {
        transform: `translateY(${Math.min(pullDistance, PULL_THRESHOLD * 1.5)}px)`,
        opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
    };

    return (
        <div
            ref={containerRef}
            className={`pull-to-refresh-container ${className || ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            <div className="ptr-indicator" style={indicatorStyle}>
                 <RefreshIcon spinning={refreshing || pullDistance > PULL_THRESHOLD} pullProgress={pullDistance / PULL_THRESHOLD} />
            </div>
            {children}
        </div>
    );
};

export default PullToRefreshContainer;