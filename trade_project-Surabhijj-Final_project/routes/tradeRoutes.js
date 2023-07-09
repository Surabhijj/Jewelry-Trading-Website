const { application } = require('express');
const express = require('express');
const controller = require('../controllers/tradeController');
const router = express.Router();
const {isGuest} = require('../middlewares/auth');
const {isLoggedIn, isCreatedBy} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');


router.get('/',controller.index);

router.get('/newTrade',isLoggedIn, controller.newTrade);

router.post('/selectTradeItem/:id',isLoggedIn, validateId,controller.selectFromTadeList);

router.post('/selectTradeItem/',isLoggedIn, controller.saveTradeDetails);

router.delete('/manageTrade/:id',isLoggedIn, controller.deleteOffer);

router.get('/manageTrade/:id', isLoggedIn,controller.manageTrade);
router.post('/manageTrade/:id', isLoggedIn,controller.acceptTrade);


router.get('/:id',validateId,controller.getJewelryById);
router.post('/:id',controller.getJewelryById);


router.get('/:id/edit',isLoggedIn, validateId, isCreatedBy, controller.editById);

router.post('/',isLoggedIn, controller.newTradeData);

router.put('/:id', isLoggedIn, validateId, isCreatedBy,controller.updateJewelryDetails);

router.delete('/:id',isLoggedIn, validateId, isCreatedBy, controller.DeleteById);

router.post('/:id/watch',isLoggedIn, controller.addToWatchList);

router.post('/:id/unwatch',isLoggedIn, controller.removeFromWatchList);




module.exports = router;