import React, { Component } from 'react';
import documentHtml from 'document';

/**
 * Component that holds the document HTML
 */
export default function DocContent() {

  return (
    <div className="doc-content" dangerouslySetInnerHTML={{__html: documentHtml}}>
    </div>
  );

}
