import React from 'react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const CustomStatusBar = styled(Slider)(({ barcolor = "#00FF99" }) => ({
  height: 12,
  padding: '16px 0',
  '& .MuiSlider-rail': {
    color: '#161616',
    opacity: 1,
    height: 12,
    borderRadius: 8,
    boxShadow: '0 2px 6px #000c, 0 0px 0px #fff',
  },
  '& .MuiSlider-track': {
    color: barcolor,
    height: 12,
    borderRadius: 8,
    boxShadow: '0 2px 6px #000c, 0 0px 0px #fff',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#111',
    border: '3px solid #444',
    boxShadow: '0 0 0 2px #000',
    marginTop: -7,
    marginLeft: -12,
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 0 1px 2px #222, 0 2px 6px #000a',
    },
  },
}));

export default function StatusBar({
  value,
  max,
  color = '#00FF99',
  label = 'HP',
  disabled = false,
  onChange
}) {
  return (
    <div style={{ margin: '16px 0', width: '100%' }}>
      <span style={{ fontWeight: 'bold', color: '#fff', marginRight: 10 }}>{label}</span>
      <CustomStatusBar
        value={value}
        min={0}
        max={max}
        color="primary"
        barcolor={color}
        disabled={true}
        onChange={onChange}
      />
      <span style={{ marginLeft: 12, color: '#fff', fontWeight: 'bold' }}>
        {value} / {max}
      </span>
    </div>
  );
}
