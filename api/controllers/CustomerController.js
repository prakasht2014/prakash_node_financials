/**
 * CustomerController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new':function(req,res){
		res.view();
	},
	
	create:function(req,res,next){
		Customer.create(req.params.all(),function customerCreated(err,customer){
			if(err) return next(err);
			res.redirect('/customer/show/'+customer.id);
		});
	},
	show:function(req,res,next){
		Customer.findOne(req.param('id')).populateAll().exec(function(err,customer){
			if(err) return next(err);
			if(!customer) return next();

			var request=require('request');

			function process_response(webservice_response,stock,body,callback){
				var webservice_data = "";
				
				var parsedVar = JSON.parse(body);
				stock.current_price = parsedVar.LastPrice;
				
				console.log("Inside process_response"+stock.symbol+ ' = $'+stock.current_price);
				callback();
			};

			function get_current_price(stock,callback){
				
				var webservice_request = request.get({url:"http://dev.markitondemand.com/MODApis/Api/v2/Quote/JSON?symbol="+stock.symbol},
					function(error,res,body){					
					process_response(res,stock,body,callback);					
				});
				//console.log("Inside get_current_price"+stock.symbol+ ' = '+stock.current_price);		
			};

			async.each(customer.stocks,get_current_price,function(err){
				if(err) console.log(err);
				//console.log('done');

				res.view({
				customer:customer
				});
			});			

			
		});		
	},
	index:function(req,res,next){
		Customer.find(function foundCustomers(err,customers){
			if(err) return next(err);
			res.view({
				customers:customers
			});
		});
	},
	edit:function(req,res,next){
		Customer.findOne(req.param('id'),function foundCustomer(err,customer){
			if(err) return next(err);
			if(!customer) return next();
			res.view({
				customer:customer
			});
		});
	},
	update:function(req,res,next){
		Customer.update(req.param('id'),req.params.all(),function customerUpdated(err){
			if(err){
				return res.redirect('/customer/edit/'+req.param('id'));
			}
			res.redirect('/customer/show/'+req.param('id'));
		});
	},
	destroy:function(req,res,next){
		Customer.destroy(req.param('id')).exec(function(){
			res.redirect('/customer/');
		});
	}
};

