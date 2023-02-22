import React from "react";

function Button({className = "", children, onClick}: {className?: string; children: string; onClick: () => void}) {
    return <button className={className + " relative justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"}
                   onClick={() => onClick()}>{children}</button>
}

export default Button;