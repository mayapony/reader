import React, { useState } from 'react'
import { Input, styled } from 'tamagui'

const StyledSearchInput = styled(Input, {
  width: '80%',
  padding: 12,
  borderWidth: 1,
  borderRadius: 8,
  backgroundColor: '$background',
  color: '$color',
  transitionDuration: '250ms',
  transitionProperty: 'transform, border-color',
})

const ModernSearchBar = () => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <StyledSearchInput
      placeholder="搜索书籍..."
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        borderColor: isFocused ? 'var(--color-primary)' : undefined,
      }}
    />
  )
}

export default ModernSearchBar
