
export class EventEmitter {
  constructor() {
    this.events = {};
  }
  on( name, callback ) {
    const callbacks = this.events[ name ];
    if ( !callbacks ) this.events[ name ] = [ callback ];
    else callbacks.push( callback );
  }
  trigger( name, event ) {
    const callbacks = this.events[ name ];
    if ( callbacks ) callbacks.forEach( callback => callback( event ) );
  }
  off( name, callback ) {
    const index = this.events[ name ].indexOf( callback );
    if ( index !== -1 ) {
      this.events[ name ].splice( index, 1 );
    }
  }
}