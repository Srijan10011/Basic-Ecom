import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Example from './src/App.reviewsystem'
import KombaiWrapper from './KombaiWrapper'
import ErrorBoundary from './ErrorBoundary'
import './src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <KombaiWrapper>
        <Example />
      </KombaiWrapper>
    </ErrorBoundary>
  </StrictMode>,
)