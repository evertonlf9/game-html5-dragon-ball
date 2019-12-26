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
			
			// this.mapSpeed = game.mapSpeed;
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
		}

	}