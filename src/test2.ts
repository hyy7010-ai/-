import { renderToStaticMarkup } from 'react-dom/server';
import { Cat, Dog, Rabbit, Turtle, Snail, Bird, Bug, PawPrint } from 'lucide-react';
import React from 'react';

const icons = { Cat, Dog, Rabbit, Turtle, Snail, Bird, Bug, PawPrint };

Object.entries(icons).forEach(([name, Icon]) => {
  const svg = renderToStaticMarkup(React.createElement(Icon, { size: 100, strokeWidth: 1.5, color: '#333' }));
  console.log(`${name}: ${svg}`);
});
