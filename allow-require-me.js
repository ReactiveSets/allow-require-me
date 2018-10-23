#! /usr/bin/env node
/*
    allow-require-me.js
    
    The MIT License (MIT)
    
    Copyright (c) 2018-2018, Reactive Sets
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
"use strict";

var path                = require( 'path' )
  , fs                  = require( 'fs'   )
  
  , cwd                 = process.cwd()
  , cwd_path            = cwd.split( path.sep )
  , cwd_last            = cwd_path.slice( -1 )[ 0 ]
  
  , env                 = process.env
  , npm_config_save     = !!env.npm_config_save
  
  , argv                = process.argv
  
  , argv_1              = argv[ 1 ].split( path.sep )
  
  , action              = argv[ 2 ] || 'show'
  
  , this_module         = 'allow-require-me'
  , self_install        = action == 'install' && cwd_last == this_module
  
  , parent_dir          = [].slice.apply( cwd_path, self_install ? [ -4, -3 ] : [ -2, -1 ] )[ 0 ]
  
  , node_modules        = 'node_modules'
  
  , package_path        = [ cwd ]
                            .concat( self_install ? [ '..', '..' ] : [] )
                            .concat( [ 'package.json' ] )
  
  , package_filename    = path.join.apply( path, package_path )
  
  , package_json        = require( package_filename )
  
  , package_name        = package_json.name
  
  , self_link           = path.join( self_install ? '..' : node_modules, package_name )
  , self_target         = '..'
;

if ( package_name == this_module ) return;

fs.lstat( self_link, process_action );

function process_action( error, self_link_lstat ) {
  var log               = logger( action )
    , is_symlink        = self_link_lstat && self_link_lstat.isSymbolicLink()
  ;
  
  if ( parent_dir == node_modules ) {
    log( 'no action because parent is', node_modules );
    
    return;
  }
  
  switch( action ) {
    default:
      console.log(
        "Usage:\n" +
        "node " + this_module + ".js <action>\n" +
        "\n" +
        "Where <action> is one of \"show\" (default), \"install\", \"add\" or \"remove\"\n"
      );
    break;
    
    case 'show':
      log( 'self link ' + ( self_link_lstat ? ( is_symlink ? 'is' : 'is not' ) + ' a symbolic link' : 'does not exist' ) + ':', self_link );
    break;
      
    case 'install':
      if ( npm_config_save || cwd_last != this_module ) {
        // config saved because npm install has save flag set, or install requested explicitely by user running this command
        
        var scripts = package_json.scripts = package_json.scripts || {}
          , changed
        ;
        
        // install( 'preinstall' , 'remove' );
        install( 'postinstall', 'add'    );
        
        if ( changed ) {
          fs.writeFile( package_filename, JSON.stringify( package_json, null, '  ' ), function( error ) {
            if ( error ) {
              log( 'unable to save package.json:', error );
            } else {
              log( 'configuration saved to package.json' );
            }
          } );
        } else {
          log( 'no configuration change' );
        }
      } else {
        log( 'not saving configuration to package.json' );
      }
      
      // Add self link regardless of configuration saving or not, even if there is an error
    // pass-through
    
    case 'add':
      if ( is_symlink ) {
        log( 'self link already exists:', self_link );
      } else {
        // does not exist or is not a symlink
        if ( self_link_lstat ) {
          // exists but is not a synlink
          remove_self_link( add_self_link );
        } else {
          add_self_link();
        }
      }
    break;
    
    case 'remove':
      remove_self_link();
    break;
  } // switch action
  
  function install( script_name, action ) {
    var command         = 'node ' + path.join( node_modules, this_module, this_module ) + '.js ' + action
      , current_command = scripts[ script_name ]
    ;
    
    if ( current_command ) {
      command = current_command
        + ( current_command.indexOf( command ) == -1 ? ' && ' + command : '' )
      ;
    }
    
    if ( scripts[ script_name ] != command ) {
      scripts[ script_name ] = command;
      
      changed = true;
    }
  } // install()
  
  function add_self_link() {
    fs.symlink( self_target, self_link, 'dir', function( error ) {
      if ( error ) {
        log( 'unable to create self link:', error );
      
      } else {
        log( 'created self link:', self_link );
      }
    } );
  } // add_self_link()
  
  function remove_self_link( next ) {
    if ( self_link_lstat ) {
      if ( ! is_symlink && self_link_lstat.isDirectory() ) {
        log( 'unable to renove directory', self_link );
      
      } else {
        fs.unlink( self_link, function( error, removed ) {
          if ( error ) {
            log( 'unable to renove self link:', error );
          
          } else {
            log( 'removed self link:', self_link, 'which was' + ( is_symlink ? '' : ' not' ), 'a synlink' );
            
            next && next();
          }
        } );
      }
    } else {
      log( 'self link not found:', self_link );
      
      next && next();
    }
  } // remove_self_link()
  
  function logger( action ) {
    return console.log.bind( null,
      argv_1.slice( -1 )[ 0 ] +
      ', package:', package_name +
      ', action:', action + ','
    );
  } // logger()
} // process_action()
