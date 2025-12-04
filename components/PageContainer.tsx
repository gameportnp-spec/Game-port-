import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    pageKey: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, pageKey }) => {
    // This is a simplified transition container. For more complex animations,
    // a library like react-transition-group would be used.
    // The key change on the outer div triggers React's reconciliation and
    // allows CSS animations on enter/exit if structured correctly.
    return (
        <div key={pageKey} className="page page-enter-active">
            {children}
        </div>
    );
};

export default PageContainer;
