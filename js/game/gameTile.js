var game = (function() {

	var requestID = null;

	/**
	 * Iniciando o jogo
	 **/
	function initGame(){
		requestID = null;
		game.init(  );
	}//initGame		 

/*-----------------------------------------------------------------------*/
		
	window.requestAnimationFrame = (function(){
	
		// Check for each browser
		// @paul_irish function
		// Globalises this function to work on any browser as each browser has a different namespace for this
		return window.requestAnimationFrame || //Chromium 
		window.webkitRequestAnimationFrame  || //Webkit
		window.mozRequestAnimationFrame     || //Mozilla Geko
		window.oRequestAnimationFrame       || //Opera Presto
		window.msRequestAnimationFrame      || //IE Trident?
		
		function( callback, element ) { //Fallback function
			var id = window.setTimeout( main, 1000 / 60 );
			return id;
		}//function		
		
	})();	

/*-----------------------------------------------------------------------*/

	window.CancelAnimationFrame = (function(id){
		// globaliza esta função para funcionar com qualquer navegador, ja que cada navegador tem um nome pro requestanimationframe distinto
		return window.cancelAnimationFrame || //chrome 
		window.webkitCancelRequestAnimationFrame || //webkit?
		window.webkitCancelAnimationFrame || //Webkit
		window.mozCancelAnimationFrame || //Mozilla
		window.oCancelAnimationFrame || //Opera
		window.msCancelAnimationFrame || //IE
        window.clearTimeout(id);
	})( requestID );

/*-----------------------------------------------------------------------*/

	function main() {

		game.criaMapa.controleDesenho();
		game.keyboard.moveObj();
		game.menu.setMenu();

		if( game.player.life > 0 ){
			requestID = requestAnimationFrame( main );		
		}else{

			CancelAnimationFrame( requestID );
			requestID = null;
			game.replayGame.gameOver();	

		}//else			
	};//main

	function pauseGame(){
		CancelAnimationFrame( requestID );
		requestID = null;
	}//pauseGame

	var game = {

		/**
		 * 
		 **/
		init: function(  ) {

			this.tamTile   = 32;
			this.canvas    = document.getElementById( "canvas" );
			this.canvFundo = document.getElementById( "canvas_fundo" );	 	
			this.loading   = document.getElementById( "onLoad" );

			this.ctx       = this.canvas.getContext( '2d' );
			this.ctxFundo  = this.canvFundo.getContext( '2d' );

			this.menuItem  = $( "#menu" );
			this.gameover  = $("#gameOver");
			this.gameover.hide();
			this.menuItem.hide();

			this.arrEnemy = [];
			this.arrTiro  = [];
			this.itemJogo = [];
			this.mapSave  = [];
			this.arrPosX  = [];
			this.arrPosY  = [];
			this.srcImg   = [];
			this.arrTiroEnemy = [];

			this.gameSalve = [];
			this.jsonData  = null;
			this.strMapa   = "mapa1";
			this.url = '../js/mapas.json';

			//propriedade dos inimigos
			this.propriedades = [ [ 
									{ frame:300, img:2, moveX:1, moveY:0, life:50, DirX:1, DirY:0, CurrPosY:2 }, 
								    { frame:100, img:3, moveX:0, moveY:1, life:30, DirX:0, DirY:1, CurrPosY:0 } 
								 ] ];
		
			this.life       = 0;
			this.qtdTiro    = 0;
			this.speed      = 0;
			this.qtdEnemy   = 0;
			this.esferas    = 0;
			this.semente    = 0;
			this.vDanoFinal = 0;
			this.valorDano  = 10;

			this.indiceArray = 0;
			this.stopAlpha   = 0;
			this.onLoadObj   = false;
			this.shenlongDraw  = false;
			
			$( "#start" ).click( function(){ game.onload.messageBox(); } );
	        
	    },//init

	    menuTela: function(){

	    	this.vidaPers  = document.getElementById( "life"   );
			this.tItem     = document.getElementById( "tItem"  );
			this.tLife     = document.getElementById( "tLife"  );
			this.tPoder    = document.getElementById( "tPoder" );
			this.tspeed    = document.getElementById( "tSpeed" );

			this.vidaPers.style.fontStyle  =  "negrito";
			this.vidaPers.style.textIndent = "3%";
	    }//menuTela
	}//game

	game.onload = {

		/**
		 * Carrega todas as imagem a serem usadas no jogo
		 **/
		carregaImg:  function(){
			game.srcImg = [ 
							'../imagens/platform/tilesheet.png', '../imagens/platform/vegetaf.png', '../imagens/platform/charizard.png', '../imagens/platform/MajinBoo.png',
							'../imagens/platform/tiro.png', '../imagens/platform/energia1.png', '../imagens/platform/itens.png', '../imagens/platform/heart.png', '../imagens/platform/dragao.png',
							'../imagens/platform/shenlong.png', '../imagens/platform/shenlongSprite.png'
						  ]; 
			
			this.imgArr = [];	

			$(game.srcImg).preloadImg(function(){
				game.onload.CarregaJson( game.url );		    
			});
			
		},//carregaImg
		
	/*-----------------------------------------------------------------------*/
		
		/**
		 * Armazena as imagens do mapa
		 **/
		armazenarImg: function( index, imgSrc ){
			
			var tileImg = [ index, new Image(), false ]; // format as explained: [id#, Image, loaded?]			
			tileImg[1].src    = imgSrc;
			tileImg[1].onload = function(){ tileImg[2] = true; }//onload			
			this.imgArr[ index ] = tileImg; // Armazena este tile

		},//store
		
	/*-----------------------------------------------------------------------*/
		
		/**
		 * Recuperar as imagens do mapa
		 **/
		recuperarImg: function( index ){	
			return this.imgArr[index][1]; // return the image object 
		},//recuperarImg

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Carrega o arquivo .json
		 **/
		CarregaJson: function( objUrl ){		
			$.ajax( {			 			
				url: objUrl,
				success: function( data ) {					
					game.jsonData = data;
					game.onload.finshLoad();	
				},
				error: function() {
					alert("Erro na requisição do arquivo json!");
				}//error				
			} );//ajax			
			//transforma obj em um objJson console.log( JSON.stringify(this.currentMap) );
		},//CarregaJson

		messageBox: function(){
			$( "#start" ).hide();
			this.txt = "Carregando...";
			this.indice = 10;
			game.onload.carregaImg();
			this.imprimeTxt();
		},

		imprimeTxt: function(){

			game.loading.innerHTML = "";
			this.texto = ( this.txt.substr( 0, this.indice ) );
			game.loading.innerHTML = this.texto;	
			
			if( !game.onLoadObj ){
			 	setTimeout( function(){ game.onload.imprimeTxt() }, 500  );
			}//if

			if( this.indice < 14 ){
				this.indice++;
			}else{
				this.indice = 10;
			}//else						
		},//imprimeTxt

		finshLoad: function(){

			$( "#onLoad" ).hide();
			game.menuTela();
			game.menuItem.show();
			game.player.setPlayer();
			game.shenlong.setShenlong();

			window.addEventListener( 'keydown', game.keyboard.keyboardDown, false );	
			window.addEventListener( 'keyup'  , game.keyboard.keyboardUp,   false );		
			game.mouseEvent.addeventsBtn();

			game.onLoadObj = true;
			main();
			game.criaMapa.CriandoMapa();

		}//finshLoad
	}//onload

	Array.prototype.removeElement = function(element) {
	  if( game.indiceArray < game.srcImg.length ){
		    game.onload.armazenarImg ( game.indiceArray, game.srcImg[game.indiceArray] );
			game.indiceArray++;
	  }//if
	  
	  for (var i = 0; i < this.length; i++) {
	    if (this[i] == element) { this.splice(i,1); }
	  }//for

	};

	$.fn.preloadImg = function(callback) {

	  checklist = this.toArray();
	  this.each(function() {
	    $('<img>').load(function() {
	      checklist.removeElement($(this).attr('src'));
	      if (checklist.length == 0) { callback(); }

	    }).attr({ src: this });//
	  });
	};

	game.menu = {

		setMenu: function(){

			game.tItem.innerHTML  = game.esferas;
			game.tLife.innerHTML  = game.life;
			game.tPoder.innerHTML = game.semente;
			game.tspeed.innerHTML = game.speed;
			game.vidaPers.innerHTML  = ( ( game.player.life * 2 ) + "%" );

		},

		setValues: function( objItem ) {

			if( objItem.tipoItem == 7 ){

				if( game.player.life < 50 ){
					game.player.life = game.player.life + 6;
					if( game.player.life > 50 ) game.player.life = 50;

				}else{
					game.life++;
				}//else

			}else if( objItem.tipoItem == 8 ){
				game.semente++;
			}else if( objItem.tipoItem == 9 ){
				game.speed++;
			}else{
				game.esferas++;
			}//else
		}//setValues
	}//game.menu

	game.mouseEvent = {

		addeventsBtn: function(){
			$(".classObj").click( function(){ game.mouseEvent.mouseOnClick( this ) } );
		},

		mouseOnClick: function( target ){

			var element = $( target );

			switch( element.data( "opcao" ) ){

				case 1:

					if( game.esferas == 7 ){
						game.shenlong.setPosition();
						game.esferas = 0;
						game.shenlongDraw = true;
					}//if

				break;

				case 2:

					if( game.life > 0 ){
						game.player.life = game.player.life + 6;
						game.life--;

						if( game.player.life > 50 ) game.player.life = 50;
					}//if

				break;

				case 3:

					if( game.semente > 0 ){

						game.semente--;						
						game.valorDano  = 5;
						setTimeout( function(){ game.valorDano  = 10; }, 100000 );

					}//if

				break;

				case 4:
					if( game.speed > 0 ){ game.speed--; }//if					
				break;

			}//switch
		}//mouseOnClick
	}//mouseEvent

	game.criaMapa = {


		controleDesenho: function() {

			game.ctx.clearRect( 0, 0, game.canvas.width, game.canvas.height );
			this.drawItem();
			this.drawPlayer();
			this.drawEnemy();
			this.drawTiro( game.arrTiro, "player" );
			this.drawTiro( game.arrTiroEnemy, "enemy" );
			this.drawIndex( );
			this.drawShenlong();

		},

		drawShenlong: function(){

			if( game.shenlongDraw ){
				this.drawCanvas( game.ctx, game.shenlong.sprite, ( game.shenlong.CurrPosX * 150 ) , game.shenlong.CurrPosY, 
								 game.shenlong.width, game.shenlong.height, game.shenlong.x, game.shenlong.y );
				game.animate.beginAnimate(  game.shenlong );
			}//if
		},

	/*-----------------------------------------------------------------------*/

		CriandoMapa: function(){

			var lin = 0,col = 0, tile;
			this.qtdEnemy = 0;
			
			game.ctxFundo.clearRect( 0, 0, game.canvFundo.width, game.canvFundo.height );

			for( lin = 0; lin < game.jsonData[game.strMapa].length ; lin++ )
		    {
			   for( col = 0; col < game.jsonData[game.strMapa][0].length; col++ )
			   {	
				  tile = ( game.jsonData[game.strMapa][lin] && game.jsonData[game.strMapa][ lin ][ col ] ) ?  game.jsonData[game.strMapa] [ lin ][ col ]: {ground: 0};
				 
				  this.drawTile( col, lin, tile.ground, false );

				  if( game.jsonData[game.strMapa][ lin ][ col ].enim != null ){				 
					  this.setEnemy( col, lin, game.jsonData[game.strMapa][ lin ][ col ].enim );				  				  			  
				  }//if						  
			    }//for col  			  
		    }// for lin			
		},//CriandoMapa

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Seta os valors iniciais dos inimigos
		 */
		setEnemy: function ( col, lin, tipoItem  ){

		    if( game.arrEnemy[ this.qtdEnemy ] == undefined )  {
				var num = game.random.sorteiaNumero( 2 );	
				game.arrEnemy[ this.qtdEnemy ] = ( new game.enemy.Enemy( col, lin, game.propriedades[0][num], tipoItem ) );
				game.arrEnemy[ this.qtdEnemy ].sprite = game.onload.recuperarImg( game.arrEnemy[ this.qtdEnemy ].spriteIndex );	  
		    }//if	

			this.qtdEnemy++;				
		},//setEnemy

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Desenha o Enemy no na tela
	 	 */
		drawEnemy: function (  ){

			var SpritePosX, SpritePosY;
			
			//desenhando tds os obj Enemy que estão no array
			for( var i = 0; i < game.arrEnemy.length; i++ ){		   
				
				SpritePosX = game.arrEnemy[ i ].CurrPosX * game.tamTile;	   
		   		SpritePosY = game.arrEnemy[ i ].CurrPosY * game.tamTile;

				this.drawCanvas( game.ctx, game.arrEnemy[ i ].sprite, SpritePosX, SpritePosY, game.tamTile, game.tamTile, 
							( game.arrEnemy[ i ].x - game.tamTile / 2 ), ( game.arrEnemy[ i ].y - game.tamTile / 2 ) );
			    
			    this.drawBarra( game.arrEnemy[ i ].color, ( ( game.arrEnemy[ i ].x - 5 )  - game.tamTile / 2 ), ( game.arrEnemy[ i ].y - game.tamTile / 2 ), game.arrEnemy[ i ].life, game.arrEnemy[ i ].barraLife   );   
			    
			    game.moving.movePlayer( game.arrEnemy[ i ] );
			    game.enemy.CriandoTiro( game.arrEnemy[ i ] );
			  
			}//for		   
		},//desenhaPlayer

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Percorre o array do mapa para
		 * procurar obj index
	 	 */
		drawIndex: function(){

			var lin = 0,col = 0;
			var tile;

		    for( lin = 0; lin < game.jsonData[game.strMapa].length; lin++ )
		    {
			    for( col = 0; col < game.jsonData[game.strMapa][0].length; col++ )
			    {	
				  tile = ( game.jsonData[game.strMapa][ lin ] && game.jsonData[game.strMapa][ lin ][ col ] ) ?  game.jsonData[game.strMapa][lin ][ col ]: {index: 0}; 
				  						 
				    if( game.jsonData[game.strMapa][ lin ][ col ].index != 0 )
						this.drawTile( col , lin, tile.index, true );
				  
			    }//for col
		    }// for lin		   
		},//desenhaIndex	

	/*-----------------------------------------------------------------------*/

		/**
		 * Desenha o personagem no na tela
	 	 */
		drawPlayer: function (  ){

			var SpritePosX, SpritePosY;

		   SpritePosX = game.player.CurrPosX * game.tamTile;		   
		   SpritePosY = game.player.CurrPosY * game.tamTile;
		   
		    if( game.player.status ){
				this.drawCarregando();
		   	}//if
		   
		   	game.ctx.save();
		   	game.ctx.globalAlpha = game.Alpha;
		   	this.drawCanvas( game.ctx, game.player.sprite, SpritePosX, SpritePosY, game.tamTile, game.tamTile, 
		  			   ( game.player.x - game.tamTile / 2 ), ( game.player.y - game.tamTile / 2 ) );
		   game.ctx.restore();
		   
		   this.drawBarra( "#FFFF00", ( ( game.player.x - game.tamTile / 2 ) - 5 ), ( ( game.player.y - game.tamTile / 2 ) - 10 ), game.player.poder, 50   );

		},//desenhaPlayer

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Desenha a energia do porsonagem carregando
		 **/
		drawCarregando: function (  ){

			game.ctx.drawImage( game.onload.recuperarImg( 5 ), ( game.player.ener * ( game.tamTile * 2 ) ), 0, ( game.tamTile * 2 ), ( game.tamTile * 2 ),
			 			      ( game.player.x - 32 ), ( game.player.y - 48 ), ( game.tamTile * 2 ), ( game.tamTile * 2 ) );
			
		},//desenhaCrregando

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Desenha o tile do mapa na tela
	 	 */
		drawTile: function ( x, y, tileSheet, tileCoud  ){   	 
			
			//pega as coordenadas no bitmap do tile, coordenada y é pego pela altura vendo a divisao de altura da largura do tile
			var CoordX;
			var CoordY = Math.floor ( tileSheet / 6 ); 

			//pega o resto da largura do tile para verificar a distancia em X do tile
			if ( tileSheet % 6 == 0 ){
				CoordX = 0;
			}else{
				CoordX = ( tileSheet % 6 );
			}//else

			game.tileShet = game.onload.recuperarImg( 0 );

			if( tileCoud ){
				this.drawCanvas( game.ctx, game.tileShet, CoordX * game.tamTile, CoordY * game.tamTile, game.tamTile, game.tamTile,  x * game.tamTile, y * game.tamTile );
			}else{
				this.drawCanvas( game.ctxFundo, game.tileShet, CoordX * game.tamTile, CoordY * game.tamTile, game.tamTile, game.tamTile,  x * game.tamTile, y * game.tamTile );
			}//else
		},//desenhaTile

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Desenha os tiros 
		 */
		drawTiro: function( tiroArray, type ){
			
		   //desenhando tds os obj tiro que estão no array
		   for( var i = 0; i < tiroArray.length; i++ ){		   
		   	  //se array de tiro for diferente de undefined desenha o tiro
			  var Sprite = tiroArray[ i ].CurrPos * game.tamTile;
				
			  //desenha o tiro na tela
			  this.drawCanvas( game.ctx, tiroArray[ i ].spritSheet, Sprite, 0, game.tamTile, game.tamTile, tiroArray[ i ].x , tiroArray[ i ].y  );
			  if( type == "player" ){
			 	game.movigTiro.setTiro( tiroArray[ i ], "player" );
			  }else{
			  	game.movigTiro.setTiro( tiroArray[ i ], "enemy" );
			  }//else
		   }//for		   
		},//criaTiro

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Desenha o item no canvas 
		 **/
		drawItem: function (  ){

			for (var i = 0; i < game.itemJogo.length; i++) {		
			
				var X = Math.round( game.itemJogo[i].x / game.tamTile );
				var Y = Math.round( game.itemJogo[i].y / game.tamTile );		

				this.drawCanvas( game.ctx, game.itemJogo[i].sprite, ( game.itemJogo[i].tipoItem * game.tamTile), 0, game.tamTile, game.tamTile, 
					        ( ( X * game.tamTile ) - (game.tamTile / 2)  ), Y * game.tamTile );
				
				game.jsonData[game.strMapa][ Y ][ X ].item = game.itemJogo[i];
			}//for
			game.moving.pregaItens();
		},//DesenhaItem	

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Desenha as imagens no canvas 
		 **/
		drawCanvas: function ( ctxDraw, objSprite, initX, initY, widthX, heightY, x, y ){		
			//----------------------altera aqui pra mexer na animaçao da imagem-------------------------
			// imagem a ser impressa, posX a ser exibida da img, posY a ser exibida da img, Widht exibido dela, height exibido dela, posX na tela, 
			// posY na tela, width da img ja cortada, height da img ja cortada		
			ctxDraw.drawImage( objSprite, initX, initY, widthX, heightY, x, y, widthX, heightY );				
		},//DesenhaItem	

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Desenha as barras de life / vida dos inimigo e do personagem e tbm barra de energia
		 **/
		drawBarra: function ( color, x, y, tamBarra, tamBarraTotal  ){	
			game.ctx.fillStyle = color;
		    //desenha barra de life
		    game.ctx.fillRect( x, y, tamBarra, 5 );
			//desenha a borda da barra de life
		    game.ctx.strokeRect( x, y,  tamBarraTotal, 5 );  
			
		}//barra
		
	/*-----------------------------------------------------------------------*/

	}//criaMapa

	game.shenlong = {

		/**
		 * 
		 **/
		setShenlong: function(){

			this.x = 0;
			this.y = 0;
			this.width  = 150;
			this.height = 107;

			this.CurrPosX = 0;
			this.CurrPosY = 0;
			this.sprite = game.onload.recuperarImg( 10 );

			//Elementos de animação do personagem
			this.acTick    = 0;
			this.tick      = 0;
			this.FrameRate = 600;
			this.lastUpdateTime = 0;

		},//setShenlong

	/*-----------------------------------------------------------------------*/

		/**
		 * 
		 **/
		setPosition: function(){

			this.x = game.player.x + 20;
			this.y = game.player.y - ( this.height / 2 );

			if( this.y < 0 ) this.y = 10;
			else if( this.y > 420 ) this.y = this.y - ( this.height / 2 );
			if( this.x > 800 ) this.x = this.x - ( this.width + 30 )

		}//setPosition
	}//game.shenlong 


	game.player = {

		/**
		 * 
		 **/
		setPlayer:function(){

			this.x = 1 * game.tamTile;
			this.y = 1 * game.tamTile;
			
			this.width = 32;
			this.height = 32;

			this.CurrPosX    = 0;
			this.CurrPosY    = 2;
			this.tipoObj = "player";
			
			this.sprite = game.onload.recuperarImg( 1 );
			this.criado = false;
			this.ativaEner = false;
			
			this.ener = 0;
			this.status = false;
			this.danoEnergia = 5;
			this.carregaEnerg = 0.1;
			this.spriteIndex = 1;
			this.life        = 50;
			this.poder       = 50;
			this.maxPod      = 50;
			this.DirX        = 1;
			this.DirY        = 0;
			this.speed       = 1;

			//Elementos de animação do personagem
			this.acTick      = 0;
			this.tick        = 0;
			this.FrameRate   = 100;
			this.lastUpdateTime = 0;

			//Elementos de animação dele carregando
			this.acTickEner      = 0;
			this.tickEner        = 0;
			this.FrameRateEner   = 200;
			this.lastUpdateTimeEner = 0;
		}//setPlayer
	}//game.player

	game.keyboard = {
		
		/**
		 * Movimentação do personagem
		 */
		moveObj: function( ){

			this.sentidoPlayer();
			if ( game.keyboard.isUp || game.keyboard.isDown || game.keyboard.isLeft || game.keyboard.isRight ){	
				game.moving.movePlayer( game.player );			
			}//if				
		},//move

	/*-----------------------------------------------------------------------*/

		/**
		 * Seta as variaveis de sentido e a variavel do sprite 
		 */
		sentidoPlayer: function(){
			//anda pra cima
			if ( game.keyboard.isUp ){
				
					game.player.DirX = 0;
					game.player.DirY = -1;
					game.player.spriteIndex = 2;
					game.player.CurrPosY = 3;
					
			//anda pra baixo
			}else if ( game.keyboard.isDown ){
				
				    game.player.DirX = 0;
					game.player.DirY = 1;
					game.player.spriteIndex = 0;
					game.player.CurrPosY = 0;
					 
			//anda pra esquerda
			}else if ( game.keyboard.isLeft ){
					
					game.player.DirY = 0;
					game.player.DirX = -1;
					game.player.spriteIndex = 3;
					game.player.CurrPosY = 1;
					 
			//anda pra direita
			}else if (game. keyboard.isRight ){	 
					
					game.player.DirY = 0;
					game.player.DirX = 1;
					game.player.spriteIndex = 1;
					game.player.CurrPosY = 2;
					
			}else{
				
				game.player.CurrPosX = 0;
				speed = 2;

			}//else
			
			
			if( game.keyboard.isEner ){
					
					if( game.player.poder < game.player.maxPod ){ 
			  			game.player.poder = ( game.player.poder + game.player.carregaEnerg );
						game.player.status = true;	
						game.animate.beginAnimateEner( game.player );
					}else{
						game.player.status = false;	
					}//else
					
		    }else if( game.keyboard.istiro ){			
				//Criava tiro	
			}//if
			
			if( !game.keyboard.isEner ){
				game.player.status = false;	
			}//if	
			
		},//sentidoPlayer

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 */
		keyboardDown:  function(event){		
			
			switch (event.keyCode){	
				
				case 38:	
					game.keyboard.isUp = true;
				break;
				
				case 40:	
					game.keyboard.isDown = true;
				break;
					
				case 37:				
					game.keyboard.isLeft = true;
				break;
					
				case 39:	
					game.keyboard.isRight = true;
				break;
				
				
				case 87:	
					game.keyboard.isUp = true;
				break;
				
				case 83:	
					game.keyboard.isDown = true;
				break;
					
				case 65:		
					game.keyboard.isLeft = true;
				break;
					
				case 68:		
					game.keyboard.isRight = true;
				break;
				
				case 32:    
			  		game.keyboard.istiro = true;			
			    break;
				
				case 16:  			
					game.player.speed = 2;						
			    break;
				
				case 17:  			
					game.keyboard.isEner = true;						
			    break;		
				
			}//switch				
		},//movePlayer

	/*-----------------------------------------------------------------------*/

		/**
		 * 
		 */
		keyboardUp: function(event){
			
			switch (event.keyCode) 
			{
				case 38:	
					game.keyboard.isUp = false;
				break;
				
				case 40:	
					game.keyboard.isDown = false;
				break;
					
				case 37:				
					game.keyboard.isLeft = false;
				break;
					
				case 39:	
					game.keyboard.isRight = false;
				break;
				
				case 87:	
					game.keyboard.isUp = false;
				break;
				
				case 83:	
					game.keyboard.isDown = false;
				break;
					
				case 65:	
					game.keyboard.isLeft = false;
				break;
					
				case 68:		
					game.keyboard.isRight = false;
				break;
				
				case 32:
				
					if( game.player.poder > 0 && !game.keyboard.isEner ){	

						if( game.player.poder > 25 ){
							game.vDanoFinal = Math.round( game.player.poder / game.valorDano )
						}//if
						game.poder.createTiro( game.vDanoFinal );					
					}//if
			  		game.keyboard.istiro = false;				
					
				break;
				
				case 16:   
					game.player.speed = 1; 		
			    break;
				
				case 17:  		
					game.keyboard.isEner = false;	
			    break;
				
			}//switch			
		}//paraPlayer
	}//keyboard

	game.colide = {
		
		/**
		 * Checka a colição do personagem com itens no mapa
		 */
		colisaoObj: function ( x, y ){	

			if( game.jsonData[game.strMapa][ y ][ x ].solido == false ){
				return true;
			}else{
				return false;
			}//else			
		},//colizao

	/*-----------------------------------------------------------------------*/
		
		/**
		 * Checka se o personagem chegou na borda do mapa
		 */
		CheckBorder: function( x, y ){			
			
			//verifica a propriedade do tile atual, se está fora da tela ou fora do mapa desenhado
			if ( ( x < 0 || Math.round( x ) > ( game.jsonData[game.strMapa][0].length - 1 ) ) || ( y < 0 || Math.round( y ) > ( game.jsonData[game.strMapa].length - 2 ) ) ){
				return false;
			}else{
				return true;
			}//else			
		},//CheckBorder

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/	
		collidesPers: function( obj1, obj2 ) {	
			
			if( obj1.tipoObj == undefined ){
				
		  		return  obj1.x < ( (obj2.x - game.tamTile / 2 ) + obj2.width ) &&
				        ( obj1.x + obj1.width ) > (obj2.x - game.tamTile / 2 )  &&
				        obj1.y < ( (obj2.y - game.tamTile / 2 ) + obj2.height ) &&
				        ( obj1.y + obj1.height )> (obj2.y - game.tamTile / 2 ) ;
			}else{

				return  (obj1.x - game.tamTile / 2 ) < ( (obj2.x - game.tamTile / 2 ) + obj2.width ) &&
			        	( (obj1.x - game.tamTile / 2 ) + obj1.width ) > (obj2.x - game.tamTile / 2 )  &&
			        	(obj1.y - game.tamTile / 2 ) < ( (obj2.y - game.tamTile / 2 ) + obj2.height ) &&
			        	( (obj1.y - game.tamTile / 2 ) + obj1.height )> (obj2.y - game.tamTile / 2 ) ;

			}//else	         
		}//collides
	}//colide

	game.enemy = {

		/**
		 * 
		 **/
		Enemy: function( col, lin, propriedades, tipoItem ){

			this.propriedade = propriedades; 
			this.x = col * game.tamTile;
			this.y = lin * game.tamTile;
			this.tipoObj = "enemy";
			
			this.width  = 32;
			this.height = 32;
			
			this.conte = 0;			
			this.range = 150;
			this.dano  = 2.5;
			
			this.pers = this.propriedade.pers;			
			this.DirX = propriedades.DirX;
			this.DirY = propriedades.DirY;			
			this.life = this.propriedade.life;
			this.barraLife = this.propriedade.life;		
			
			this.col = col;
			this.lin = lin;
			this.inicialX = col;
			this.inicialY = lin;
			
			this.moveX = this.propriedade.moveX;
			this.moveY = this.propriedade.moveY;			
				
			this.color = "#FF0000";			
			this.spriteIndex = this.propriedade.img;	
			
			this.andar   = true;
			this.sprite  = null;
			this.speed   = 1;
			this.colidiu = false;

			this.CurrPosX  = 0;
			this.CurrPosY  = this.propriedade.CurrPosY;

			this.acTick    = 0;
			this.tick      = 0;
			this.FrameRate = this.propriedade.frame;
			this.lastUpdateTime = 0;
			this.tipoItem = tipoItem;
			
		},//Enemy

		CriandoTiro: function( objEnemy ){

			if ( Math.sqrt ( Math.pow ( objEnemy.y - game.player.y, 2 ) + Math.pow ( objEnemy.x- game.player.x , 2 ) ) < objEnemy.range ){	
				
				if( objEnemy.conte == 30 ){
					game.arrTiroEnemy.push( new game.poder.newTiro( objEnemy, 5 ) );
					objEnemy.conte = 0;
					this.perseguePlayer( objEnemy );
				}else{
					objEnemy.conte++;
				}//esle	
			}//if			
		},//CriandoTiro

		perseguePlayer: function( objEnemy ){
			
			//verifica se o personagem e o inimigo estão no mesmo eixo X
			if( objEnemy.x > (game.player.x - game.tamTile ) && objEnemy.x < (game.player.x + game.tamTile )  ){

				if( objEnemy.y > game.player.y ){
					//alterando a direção y do Enemy
					objEnemy.DirX = 0;
					objEnemy.DirY = -1;
					//alterando a folha de sprite
					objEnemy.CurrPosX = 0;
					objEnemy.CurrPosY = 3;
				}else if( objEnemy.y < game.player.y ){
					//alterando a direção y do Enemy
					objEnemy.DirX = 0;
					objEnemy.DirY = 1;
					//alterando a folha de sprite
					objEnemy.CurrPosX = 0;
					objEnemy.CurrPosY = 0;
				}//else
			}//if

			//verifica se o personagem e o inimigo estão no mesmo eixo Y
			if( objEnemy.y > (game.player.y - game.tamTile ) && objEnemy.y < (game.player.y + game.tamTile )  ){

				if( objEnemy.x > game.player.x ){
					//alterando a direção x do Enemy
					objEnemy.DirX = -1;
					objEnemy.DirY = 0;
					//alterando a folha de sprite
					objEnemy.CurrPosX = 0;
					objEnemy.CurrPosY = 1;
				}else if( objEnemy.x < game.player.x ){
					//alterando a direção x do Enemy
					objEnemy.DirX = 1;
					objEnemy.DirY = 0;
					//alterando a folha de sprite
					objEnemy.CurrPosX = 0;
					objEnemy.CurrPosY = 2;
				}//else
			}//if
		}//perseguePlayer
	}//game.enemy

	game.animate = {		

		/**
		 * 
		 **/
		beginAnimate: function( objAnimate ){

			objAnimate.tick = Date.now() - objAnimate.lastUpdateTime;
			// console.log( objAnimate.acTick, objAnimate.FrameRate )
			//intervalo da animaçao, quando chega no limite, zera o contador e anima
			if ( objAnimate.acTick > objAnimate.FrameRate )
			{		
				objAnimate.acTick = 0;				
				//atualiza o frame do passo, e caso ele chege ao final da animaçao do passo , volta pro estado inicial
				objAnimate.CurrPosX++;
				if ( objAnimate.CurrPosX > 3 ){
					objAnimate.CurrPosX = 0;
				}//if

			}else{			
				objAnimate.acTick += objAnimate.tick;
			}//else	
			
			objAnimate.lastUpdateTime = Date.now();
		},//beginAnimate 

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		beginAnimateEner: function( objAnimateEner ){

			objAnimateEner.tickEner = Date.now() - objAnimateEner.lastUpdateTimeEner;
			// console.log( objAnimate.acTick, objAnimate.FrameRate )
			//intervalo da animaçao, quando chega no limite, zera o contador e anima
			if ( objAnimateEner.acTickEner > objAnimateEner.FrameRateEner )
			{		
				objAnimateEner.acTickEner = 0;
				
				//atualiza o frame do passo, e caso ele chege ao final da animaçao do passo , volta pro estado inicial
				objAnimateEner.ener++;
				if ( objAnimateEner.ener > 3 ){
					objAnimateEner.ener = 0;
				}//if

			}else{			
				objAnimateEner.acTickEner += objAnimateEner.tickEner;
			}//else	
			
			objAnimateEner.lastUpdateTimeEner = Date.now();
		}//beginAnimateEner	
	}//game.animate 

	game.moving = {

		/**
		 * Responsabel pela movimentação do personagem
		 */
		movePlayer: function( objMove ){			
			
			var prevX = objMove.x;
			var prevY = objMove.y;
			
			//tile atual	
			var tileX = Math.round ( ( ( objMove.x - game.tamTile / 2 ) + 8 * objMove.DirX )  / game.tamTile );
			var tileY = Math.round ( ( ( objMove.y - game.tamTile / 2 ) + 2 * objMove.DirY )  / game.tamTile );
			
			//verifica os limites do mapa		
			if( game.colide.CheckBorder( tileX, tileY ) ){

				//verifica a colisão do player
				if( game.colide.colisaoObj( tileX, tileY ) ){
					
					game.animate.beginAnimate( objMove );		
					objMove.x += ( objMove.DirX * objMove.speed );		
					objMove.y += ( objMove.DirY * objMove.speed );

					if( objMove.tipoObj != "enemy" ){
						game.swapMap.CheckMapa( tileX, tileY );
					}//if	

					if( objMove.tipoObj == "enemy" && !objMove.colidiu ){
						this.verificaColPers( objMove );
					}//if

				}else if( objMove.tipoObj == "enemy" ){
					this.swapDirSpriteEnemy( objMove, prevX, prevY );					
				}else {

					objMove.x = prevX;		
					objMove.y = prevY;	

				}//if

			}else if( objMove.tipoObj == "enemy" ){
				this.swapDirSpriteEnemy( objMove, prevX, prevY );
			}//else			
		},//andarPlayer

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		verificaColPers: function( objColide ){

			if( game.colide.collidesPers( objColide, game.player ) ){

				if( game.player.life > 0 ){	

					game.player.life = game.player.life - objColide.dano;
					objColide.colidiu = true;
					this.animaAlpha0( objColide );	
					
					setTimeout( function(){ 
						objColide.colidiu = false;
					}, 1000 ); 	

				}//if
			}//if
	    },

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		animaAlpha0: function( objColide ){

			if( game.stopAlpha < 3 ){
				game.Alpha = 0.5;
				setTimeout( function(){ game.moving.animaAlpha1(); }, 200 ); 
			}else{
				game.stopAlpha = 0;
			}//else
		},

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		animaAlpha1: function(){

			game.stopAlpha++;
			game.Alpha = 1;
			setTimeout( function(){ game.moving.animaAlpha0();	}, 200 ); 
		},

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		pregaItens: function(  ){

			for (var i = 0; i < game.itemJogo.length; i++) {

				var tileX = Math.round ( game.player.x / game.tamTile );
				var tileY = Math.round ( game.player.y / game.tamTile );
				
				// if( game.colide.collidesPers(game.player, game.itemJogo[i]) ){
				if( game.jsonData[game.strMapa][ tileY ][ tileX ].item == game.itemJogo[i] ){

					game.menu.setValues( game.itemJogo[i] );
					game.itemJogo.splice( i, 1 );
					i = game.itemJogo.length;

				}//if
			}//for
		},

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		swapDirSpriteEnemy: function( obj, prevX, prevY ){

			obj.DirX = ( obj.DirX * -1 );
			obj.DirY = ( obj.DirY * -1 );
			obj.x = prevX;		
			obj.y = prevY;
			
			if( obj.CurrPosY == 1 && obj.DirX == 1 ){
				obj.CurrPosY = 2;
			}else if( obj.CurrPosY == 2 && obj.DirX == -1){
				obj.CurrPosY = 1;
			}else if( obj.CurrPosY == 3 && obj.DirY == 1){
				obj.CurrPosY = 0;
			}else{
				obj.CurrPosY = 3;
			}//else
		}//swapDirSpriteEnemy
	}//moving

	game.poder = {

		/**
		 * 
		 **/
		newTiro: function ( personagem, dano ){	

			this.pers = personagem;
			//setando as direção x e y em 1 ou -1
			this.DirX = this.pers.DirX;
			this.DirY = this.pers.DirY;

			if( this.DirX == 1 ){
				this.x = ( this.pers.x * this.DirX );
				this.y = this.pers.y - ( game.tamTile / 2 );
				this.CurrPos     = 0;
			}else if( this.DirX == -1 ){
				this.x = this.pers.x - game.tamTile;
				this.y = this.pers.y - ( game.tamTile / 2 );
				this.CurrPos     = 3;
			}else if( this.DirY == 1 ){
				this.x = this.pers.x - ( game.tamTile / 2 );
				this.y = ( this.pers.y * this.DirY );
				this.CurrPos     = 1;
			}else{
				this.x = this.pers.x - ( game.tamTile / 2 );
				this.y = this.pers.y - ( game.tamTile );
				this.CurrPos     = 2;
			}//else		
			
			this.width  = game.tamTile;
			this.height = game.tamTile;

			this.spritSheet = game.onload.recuperarImg( 4 );
			
			this.inicialX = 0;
			this.inicialY = 0;			
			this.speed  = 4;
			this.indice = 0;			
			this.dano = dano;			
			this.spriteIndex = 0;

			this.tick        = 0;
			this.acTick      = 0;
			this.FrameRate   = 100;
			this.lastUpdateTime = 0;
			
			this.tile = 0;			
			this.val = false;

		},//newTiro

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		createTiro: function( valDano ){
			
			game.arrTiro.push( new game.poder.newTiro( game.player, valDano ) ); 
		
			if( game.player.poder > 0 ){
				game.player.poder = game.player.poder - game.player.danoEnergia;
				if( game.player.poder < 0 )
					game.player.poder = 0;
			}//if
		}//createTiro
	}//poder

	game.movigTiro = {

		/**
		 * 
		 **/
		setTiro: function( objTiro, type ){	

			var tileX = Math.round ( objTiro.x / game.tamTile );
			var tileY = Math.round ( objTiro.y / game.tamTile );

			if( type == "player" ){
				this.colisaoEnemy( objTiro );
				this.colisaoTiros( objTiro );
			}else{
				this.colisaoPlayer( objTiro );
			}//else


			if( game.colide.CheckBorder( tileX, tileY ) ){

				//verifica a colisão do player
				if( game.colide.colisaoObj( tileX, tileY ) ){
					//Faz os tiros se moverem nas sua respectivas direções 1 ou -1
					if( objTiro.DirX == 1 || objTiro.DirX == -1 ){			
						objTiro.x += objTiro.speed * objTiro.DirX;			
					} else if( objTiro.DirY == 1 || objTiro.DirY == -1 ){			
						objTiro.y += objTiro.speed * objTiro.DirY;			
					}//else
				}else{

					if( type == "player" ){
						this.destroyObj( objTiro, game.arrTiro );
					}else{
						this.destroyObj( objTiro, game.arrTiroEnemy );
					}//else					
				}//else

			}else{

				if( type == "player" ){
					this.destroyObj( objTiro, game.arrTiro );
				}else{
					this.destroyObj( objTiro, game.arrTiroEnemy );
				}//else
			}//else			
		},//setTiro

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		colisaoTiros: function( obj ){
				
			for( var j = 0; j < game.arrTiroEnemy.length; j++ )
			{	 
		 		// verifica a posição do tiro e a do personagem no stage
				if( game.colide.collidesPers( obj, game.arrTiroEnemy[ j ] )){
					this.destroyObj( game.arrTiroEnemy[ j ], game.arrTiroEnemy );
					this.destroyObj( obj, game.arrTiro);
				}//if
			}//for
		},

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		colisaoEnemy: function( objTiro ){			
							
			for( var i = 0; i < game.arrEnemy.length; i++ )
			{			
			 	// verifica a posição do tiro e a do personagem no stage
				if( game.colide.collidesPers( objTiro, game.arrEnemy[ i ] ) == true )		
				{
					this.destroyObj( objTiro, game.arrTiro );
					game.arrEnemy[ i ].life = game.arrEnemy[ i ].life - objTiro.dano;
					
					if( game.arrEnemy[ i ].life <= 1 ){
						
						game.jsonData[game.strMapa][ game.arrEnemy[ i ].inicialY ][ game.arrEnemy[ i ].inicialX ].enim = null;

						if( game.arrEnemy[ i ].tipoItem < 10 ){
							game.itemJogo.push ( new game.objItens.itensJogo( game.arrEnemy[ i ] ) );
						}//if
						this.destroyObj( game.arrEnemy[ i ], game.arrEnemy );
						
					}//if

					i = game.arrEnemy.length;							
				}//if				
			}//for				
		},//colisaoEnemy

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		colisaoPlayer: function( objTiro ){

			if( game.colide.collidesPers( objTiro, game.player ) ){

				this.destroyObj( objTiro, game.arrTiroEnemy );

				if( game.player.life > 0 ){
					game.player.life = game.player.life - objTiro.dano;
				}//if

				if( game.player.life < 0 ){
					game.player.life = 0;
				}//if
			}//if
		},

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		destroyObj: function( objTiro, objArray ){

			for (var i = 0; i < objArray.length; i++) {

				if( objArray[i] == objTiro ){
					objArray.splice( i, 1 );
				}//if
			}//for
		}//destroyObj
	}//movigTiro

	game.objItens = {

		/**
		 * 
		 **/
		itensJogo: function( obj ){

			this.x = obj.x;
			this.y = obj.y;			
			this.width  = game.tamTile;
			this.height = game.tamTile;
			this.tipoItem = obj.tipoItem;		
			this.sprite   = game.onload.recuperarImg( 6 );		
			
		}//itensJogo
	}//game.objItens

	game.swapMap = {

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Set o mapa que será desenhado 
		 */
		setMap: function ( indexMapa ){	

			this.mapAnt = game.jsonData[game.strMapa];

			switch( indexMapa ){

				case 1:
					game.strMapa = "mapa1";
				break;

				case 2:
					game.strMapa = "mapa2";
				break;

				case 3:
					game.strMapa = "mapa3";
				break;

			}//switch

			game.arrEnemy = [];
			game.arrTiro  = [];
			game.arrTiroEnemy = [];
		    this.varificaPosPerso(  );
		    this.salveInfMap( game.jsonData[game.strMapa] );
			
		},//setMap

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Verifica se existe um portal ou outro mapa
		 */
		CheckMapa: function( x, y )
		{
			if( game.jsonData[game.strMapa][ y ][ x ].mapa != undefined ){
				this.setMap( game.jsonData[game.strMapa][ y ][ x ].mapa );
			}//if
			
		},//CheckMapa

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		salveInfMap: function( mapData ){

			var flag = false;
			
			for( var i = 0; i < game.mapSave.length; i++ ){
				if( game.mapSave[i] == mapData ){
					flag = true;				
				}//if
			}//for

			if( !flag ){
				this.atualizaPosProximo();			
			}else{
				this.atualizaPosVolta();
			}//else
			game.criaMapa.CriandoMapa(  );
		},

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Verifica a posição que o personagem no array
		 */
		varificaPosPerso: function (  )
		{	
			for (var lin = 0; lin < game.jsonData[game.strMapa].length; lin++) {
				for (var col = 0; col < game.jsonData[game.strMapa][0].length; col++) {
					 // verifica se a propriedade pers existe no array
					if( game.jsonData[game.strMapa][ lin ][ col ].pers != undefined  )
					{
						if( game.jsonData[game.strMapa][ lin ][ col ].pers == 1 ){				
							this.PosPersX = ( col  ) * game.tamTile;
							this.PosPersY = ( lin  ) * game.tamTile;
						}//if
					}//if 
				}//for col
			}//for lin
			
		},//varificaPosPortal

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Atualiza a posição do personagem no proximo mapa
		 */
		atualizaPosProximo: function(  )
		{			
			game.mapSave.push( this.mapAnt );
			game.arrPosX.push( game.player.x );
			game.arrPosY.push( game.player.y );
			
			//Atualiza a posição do personagem no proximo mapa
			game.player.x = this.PosPersX;
			game.player.y = this.PosPersY;
				
		},//atualizaPosProximo

	/*-----------------------------------------------------------------------*/
		
		/*
		 * Atualiza posição do personagem e das cameras
		 * na volta para o mapa anterior 
		 */
		atualizaPosVolta: function (){

			var index = ( game.mapSave.length - 1 );
			game.player.x = game.arrPosX[index];
			game.player.y = game.arrPosY[index];

			game.arrPosX.splice( index, 1 );
			game.arrPosY.splice( index, 1 );
			game.mapSave.splice( index, 1 );

		}//atualizaPosVolta

	}//game.swapMap

	game.random = {
	  
	    /**
		 * ...
		 * Randomiza nº aleatorios dentro de um intervalo de 0 a um valor determinado pelo programador
		 * 
		 * @author Everton
		 * @param _Num  valor maximo do intervalo do sorteio ( 0 e _Num )
		 */
		sorteiaNumero: function( _Num ){

			var sorteio = [ ]; 
			var flagWhile = true;
			var x = 0;
			
			while ( flagWhile ) {
				x = Math.floor( Math.random() * _Num );
				flagWhile = false;
				
				for ( var i = 0; i < sorteio.length; i++ ){
					if ( sorteio[ i ] == x ){
						flagWhile = true;
						break;
					} //if	
				}//for			
			}//while			
			sorteio.push( x );
			return x;	
		 
		}// function sorteiaNumero
	}//game.random

	game.replayGame = {

		/**
		 * 
		 **/
		salveGame: function(){

			game.gameSalve[0] = game.jsonData[game.strMapa];
			game.gameSalve[1] = game.itemJogo;
			game.gameSalve[2] = game.arrPosX;
			game.gameSalve[3] = game.arrPosY;

		},//salveGame

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		gameOver: function(){
			
			$( "#item" ).hide();
			game.gameover.show();
			this.salveGame();
			game.gameover.unbind("click");
			game.gameover.click( this.zeraVariaveis );
			// game.gameover.click( this.resetGame );

		},//gameOver

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		restoreGame: function(  ){

			$( "#item" ).show();
			game.gameover.hide();

			game.ativaMenu    = false;	
			game.player.life  = 50;	
			game.player.poder = 50;

			game.jsonData[game.strMapa] = game.gameSalve[0];
			game.arrTiroEnemy = [];
			game.arrTiro      = [];
			game.mapSave      = [];
			game.gameSalve    = [];
			main();

		},//restoreGame

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		resetGame: function(){

			game.itemJogo = game.gameSalve[1];
			game.arrPosX  = game.gameSalve[2];
			game.arrPosY  = game.gameSalve[3];
			game.replayGame.restoreGame();

		},//resetGame

	/*-----------------------------------------------------------------------*/
		
		/**
		 * 
		 **/
		zeraVariaveis: function(){

			game.itemJogo = [];
			game.arrPosX  = [];
			game.arrPosY  = [];

			game.player.x = ( 1 * game.tamTile );
			game.player.y = ( 1 * game.tamTile );
			this.CurrPosX = 0;
			this.CurrPosY = 2;
			game.replayGame.restoreGame();

		}//zeraVariaveis
	}//game.replayGame

	return{ initGame :initGame }//return

})();//game
$(function () { game.initGame(); });