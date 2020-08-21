let _rave_blex_uuid = '00000000-0000-1000-8000-00805f9b34fb';
var _rave_ble_device;
var _rave_ble_service;
var _rave_payer = null;

function _rave_youtube_player(player) {
	_rave_payer = player;
}

function _rave_YT_timecheck() {
	//var tm = _rave_payer.getDuration();
	var tm = _rave_payer.getCurrentTime();
	//console.log(tm);
}

function _rave_ble_paring() {


	// console.log(document.querySelector('#rave_pair').value);
	document.querySelector('#rave_pair').value = "Finding..."
	document.querySelector('#rave_pair').disabled = true;

	//setInterval(_rave_YT_timecheck, 1000);
	_rave_ble_device = null;
  
	let filters = [];

	let options = {};
	filters.push({services: [_rave_blex_uuid]});
	options.filters = filters;

	console.log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice(options)
	.then(device => {
		_rave_ble_device = device;
		_rave_ble_device.addEventListener('gattserverdisconnected', _rave_reconnect);
		console.log('> Name:             ' + device.name);
		console.log('> Id:               ' + device.id);
		_rave_connect(false);
	})
	.catch(error => {
		console.log(error);

		document.querySelector('#rave_pair').value = "Find KBX";
		document.querySelector('#rave_pair').disabled = false;

	});

	
	// if (_rave_ble_device) {
	// 	document.querySelector('#rave_pair').value = "Connected"
		
	// } else {
	// 	document.querySelector('#rave_pair').value = "Find KBX"
	// }
}

function _rave_bleconnect() {
	return _rave_ble_device.gatt.connect();
}

function _rave_reconnect() {
	document.querySelector('#rave_pair').value = "Reconnecting...";
	// document.querySelector('#rave_pair').disabled = false;
	_rave_connect(true);
	// document.querySelector('#rave_pair').value = "?.";
	console.log("reconnecting...")
}

function _rave_connect(retry) {
	_rave_bleconnect()
	.then(server => {
		return server.getPrimaryService(_rave_blex_uuid);
	})
	.then(service => {
		return service.getCharacteristic(_rave_blex_uuid);
	})
	.then(characteristic => {
		_rave_ble_service = characteristic;
		var  rgb = new Uint8Array([ 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]); // 00FFFFFF000000000000
		return characteristic.writeValue(rgb);
	}).then(() => {
		document.querySelector('#rave_pair').value = "Connected"
		document.querySelector('#rave_pair').disabled = true;
	})
	.catch(error => {
		if (retry) {

			console.log("reconnecting... retry")
			setTimeout(_rave_reconnect, 3000);
			document.querySelector('#rave_pair').value = "Find KBX"
			document.querySelector('#rave_pair').disabled = false;
		}
		else     {
			console.log('Argh! ' + error);
			document.querySelector('#rave_pair').value = "Find KBX"
			document.querySelector('#rave_pair').disabled = false;
		}
	});
}

function _rave_ble_write(data) {  

	if (data) {
		console.log("_rave_ble_write:(" + data + ")");

		var bindata = new Uint8Array([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		for (var bytes = [], c = 0; c < data.length; c += 2) {
			bindata[c/2] = (parseInt(data.substr(c, 2), 16));
		}

		console.log("bindata: "+ bindata)

		if (_rave_ble_service) {
			_rave_ble_service.writeValue(bindata)
			// .then(result => {
			// 	if (result) {
			// 		console.log("_rave_ble_service.writeValue() OK~!" + result);
			// 	} else {
			// 		console.log("_rave_ble_service.writeValue() failed");
			// 		return;
			// 	}
			// })
			.catch (error => {
				console.log("error" + error);
			});
		} else {
			console.log("_rave_ble_write failed : _rave_ble_service is null." );
		}
	} else {
		console.log("_rave_ble_write failed : no data" );
	}
	
}




// ​function _rave_ble_write(data) {
// 	_rave_ble_service.writeValue(data)
// 	.then(result => {
// 	 console.log('Success');
// 	})
// 	.catch(error => {
// 	 console.log(error);
// 	});
//    }