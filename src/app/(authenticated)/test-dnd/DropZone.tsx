// DropZone.js

import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = (props: { onDrop:(item: {name:string}) => void }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'item',
        drop: (item:{name:string}) => props.onDrop(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={(node)=>{drop(node)}}
            style={{
                border: `1px dashed ${isOver ? 'green' : 'black'}`,
                padding: '10px',
            }}>
            Drop here
        </div>
    );
};

export default DropZone;