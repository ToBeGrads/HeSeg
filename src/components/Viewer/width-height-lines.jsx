{/* Measurement Rulers - Width and Height (Outside Image) */}

{viewMode === 'single'&& volumeData && (
    <>
      {/* Top ruler - Width */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: '0px',
        width: `${actualWidth}px`,
        height: '30px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 0',
        fontSize: '8px',
        color: '#7ddb94',
        fontFamily: "'Courier New', monospace",
        zIndex: 10,
        pointerEvents: 'none',
        opacity: "0.0"
      }}>
        {(() => {
          // More ticks when zoomed, but keep spacing reasonable
          const baseTicks = 10
          const zoomFactor = Math.min(viewState.scale, 5) // Cap at 5x
          const numTicks = Math.floor(baseTicks * zoomFactor)
          const pixelDim = orientation === 'sagittal' ? volumeData.pixDims[1] : volumeData.pixDims[0]
          const totalMM = slice.width * pixelDim
          
          // Show fewer labels when more zoomed to avoid density
          const labelInterval = viewState.scale > 3 ? 3 : viewState.scale > 2 ? 2 : 2
          
          return Array.from({ length: numTicks + 1 }).map((_, i) => {
            const mmValue = (totalMM * i / numTicks)
            const showLabel = i % labelInterval === 0
            const isMajorTick = i % 5 === 0
            
            return (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                opacity: showLabel ? 1 : 0.4
              }}>
                <div style={{ 
                  width: '1px', 
                  height: isMajorTick ? '12px' : '6px', 
                  backgroundColor: '#7ddb94',
                  marginBottom: '2px'
                }} />
                {showLabel && (
                  <span style={{ 
                    fontSize: viewState.scale > 2 ? '6px' : '7px',
                    whiteSpace: 'nowrap'
                  }}>
                    {mmValue.toFixed(0)}
                  </span>
                )}
              </div>
            )
          })
        })()}
      </div>
  
      {/* Left ruler - Height */}
      <div style={{
        position: 'absolute',
        top: '0px',
        left: '-35px',
        height: `${actualHeight}px`,
        width: '35px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 0',
        fontSize: '8px',
        color: '#7ddb94',
        fontFamily: "'Courier New', monospace",
        zIndex: 10,
        pointerEvents: 'none',
        opacity: "0.5"
      }}>
        {(() => {
          // More ticks when zoomed, but keep spacing reasonable
          const baseTicks = 10
          const zoomFactor = Math.min(viewState.scale, 5) // Cap at 5x
          const numTicks = Math.floor(baseTicks * zoomFactor)
          const pixelDim = orientation === 'axial' ? volumeData.pixDims[1] : volumeData.pixDims[2]
          const totalMM = slice.height * pixelDim
          
          // Show fewer labels when more zoomed to avoid density
          const labelInterval = viewState.scale > 3 ? 3 : viewState.scale > 2 ? 2 : 2
          
          return Array.from({ length: numTicks + 1 }).map((_, i) => {
            const mmValue = (totalMM * i / numTicks)
            const showLabel = i % labelInterval === 0
            const isMajorTick = i % 5 === 0
            
            return (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center',
                opacity: showLabel ? 1 : 0.4
              }}>
                {showLabel && (
                  <span style={{ 
                    marginRight: '3px', 
                    fontSize: viewState.scale > 2 ? '6px' : '7px',
                    whiteSpace: 'nowrap'
                  }}>
                    {mmValue.toFixed(0)}
                  </span>
                )}
                <div style={{ 
                  width: isMajorTick ? '12px' : '6px', 
                  height: '1px', 
                  backgroundColor: '#7ddb94'
                }} />
              </div>
            )
          })
        })()}
      </div>
  
      {/* Corner label - mm */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: '-35px',
        width: '35px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '7px',
        color: '#7ddb94',
        fontFamily: "'Courier New', monospace",
        fontWeight: 'bold',
        zIndex: 11,
        pointerEvents: 'none'
      }}>
        mm
      </div>
  
      {/* Top border line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${actualWidth}px`,
        height: '1px',
        backgroundColor: '#7ddb94',
        opacity: 0.3,
        zIndex: 9,
        pointerEvents: 'none'
      }} />
  
      {/* Left border line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: `${actualHeight}px`,
        width: '1px',
        backgroundColor: '#7ddb94',
        opacity: 0.3,
        zIndex: 9,
        pointerEvents: 'none'
      }} />
    </>
  )}