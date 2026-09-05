import { renderToStaticMarkup } from 'react-dom/server';
import { Sun, Cloud, Moon, Star, Snowflake, Zap, Heart, Ghost, Smile, Sparkles, Coffee, Cat, Dog, Rabbit, Turtle, Snail, Bird, Bug, PawPrint } from 'lucide-react';
import React from 'react';

const icons = { Sun, Cloud, Moon, Star, Snowflake, Zap, Heart, Ghost, Smile, Sparkles, Coffee };

Object.entries(icons).forEach(([name, Icon]) => {
  const svg = renderToStaticMarkup(React.createElement(Icon));
  console.log(`${name}: ${svg}`);
});
