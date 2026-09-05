import { renderToStaticMarkup } from 'react-dom/server';
import { Cat } from 'lucide-react';
import React from 'react';
console.log(renderToStaticMarkup(React.createElement(Cat)));
