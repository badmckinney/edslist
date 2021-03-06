const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'server/uploads/' });
const isAuthenticated = require('../isAuth');

const bookshelf = require('../../../database/models/bookshelf');
const Item = require('../../../database/models/Item');
const Category = require('../../../database/models/Category');
const Condition = require('../../../database/models/Condition');
const ItemStatus = require('../../../database/models/ItemStatus');
const User = require('../../../database/models/User');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
AWS.config.credentials = new AWS.ECSCredentials({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  httpOptions: { timeout: 5000 },
  maxRetries: 10,
  retryDelayOptions: { base: 200 }
});
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

/************************
 *  GET
 ************************/

router.get('/items', (req, res) => {
  Item
    .forge()
    .orderBy('updated_at', 'DESC')
    .fetchAll({
      withRelated: ['createdBy', 'category', 'condition', 'status']
    })
    .then(items => {
      res.json(items);
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

router.get('/items/owned', isAuthenticated, (req, res) => {
  const id = req.user.id;

  Item.where('created_by', id)
    .orderBy('updated_at', 'DESC')
    .fetchAll({
      withRelated: ['createdBy', 'category', 'condition', 'status']
    })
    .then(items => {
      res.json(items);
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

router.get('/items/category/:category/top', (req, res) => {
  const category_name = req.params.category;
  new Category({ name: category_name })
    .fetch()
    .then(category => {
      if (!category) {
        res.status(404);
        return res.send([]);
      }

      category = category.toJSON();

      Item.where('category_id', '=', category.id)
        .orderBy('views', 'DESC')
        .fetchAll({
          withRelated: ['createdBy', 'category', 'condition', 'status']
        })
        .then(items => {
          itemList = items.toJSON().slice(0, 10);
          res.json(itemList);
        });
    })
    .catch(err => {
      res.status(500);
      //sending empty object to render for now
      res.send([]);
    });
});

router.get('/items/category/:category', (req, res) => {
  const category_name = req.params.category;
  new Category({ name: category_name }).fetch().then(category => {
    category = category.toJSON();
    Item.where('category_id', '=', category.id)
      .orderBy('updated_at', 'DESC')
      .fetchAll({
        withRelated: ['createdBy', 'category', 'condition', 'status']
      })
      .then(items => {
        itemList = items.toJSON();
        items = [];

        itemList.forEach(item => {
          const itemData = {
            id: item.id,
            created_by: item.created_by.username,
            status: item.status.name,
            status_id: item.status_id,
            category: item.category.name,
            condition: item.condition.name,
            name: item.name,
            image: item.image,
            description: item.description,
            price: item.price,
            manufacturer: item.manufacturer,
            model: item.model,
            dimensions: item.dimensions,
            created_at: item.created_at,
            updated_at: item.updated_at,
            notes: item.notes,
            views: item.views
          };

          items.push(itemData);
        });
        res.json(items);
      })
      .catch(err => {
        res.status(500);
        res.json(err);
      });
  });
});

router.get('/items/status/:status', (req, res) => {
  const status_id = req.params.status;

  Item.where({ status_id: status_id })
    .fetchAll({
      withRelated: ['createdBy', 'category', 'condition', 'status']
    })
    .then(items => {
      itemList = items.models;
      items = [];

      itemList.forEach(item => {
        item = item.attributes;
        const relations = item.relations;
        const condition = relations.condition.attributes;
        const category = relations.category.attributes;
        const createdBy = relations.createdBy.attributes;
        const status = relations.status.attributes;

        const itemData = {
          id: item.id,
          created_by: createdBy.username,
          status: status.name,
          category: category.name,
          condition: condition.name,
          name: item.name,
          image: item.image,
          description: item.description,
          price: item.price,
          manufacturer: item.manufacturer,
          model: item.model,
          dimensions: item.dimensions,
          created_at: item.created_at,
          updated_at: item.updated_at,
          notes: item.notes,
          views: item.views
        };

        items.push(itemData);
      });
      res.json(items);
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

router.get('/items/search/:term', (req, res) => {
  let term = req.params.term;

  Item.query(qb => {
    qb.whereRaw('LOWER(name) LIKE ?', '%' + term.toLowerCase() + '%')
      .orWhereRaw('LOWER(description) LIKE ?', '%' + term.toLowerCase() + '%')
      .orWhereRaw('LOWER(manufacturer) LIKE ?', '%' + term.toLowerCase() + '%')
      .orWhereRaw('LOWER(model) LIKE ?', '%' + term.toLowerCase() + '%')
      .orWhereRaw('LOWER(notes) LIKE ?', '%' + term.toLowerCase() + '%');
  })
    .fetchAll({
      withRelated: ['createdBy', 'category', 'condition', 'status']
    })
    .then(items => {
      res.json({ items: items });
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

router.get('/items/:id', (req, res) => {
  const id = req.params.id;
  Item.where({ id: id })
    .fetch({
      withRelated: ['createdBy', 'category', 'condition', 'status']
    })
    .then(item => {
      if (!item) {
        res.status(400);
        return res.json({ error: 'That item does not exist' });
      }

      item = item.toJSON();

      const itemData = {
        id: item.id,
        createdBy: item.createdBy.username,
        status: item.status.name,
        status_id: item.status_id,
        category: item.category.name,
        category_id: item.category_id,
        condition: item.condition.name,
        condition_id: item.condition_id,
        name: item.name,
        image: item.image,
        description: item.description,
        price: item.price,
        manufacturer: item.manufacturer,
        model: item.model,
        length: item.length,
        width: item.width,
        height: item.height,
        created_at: item.created_at,
        updated_at: item.updated_at,
        notes: item.notes
      };

      res.json({
        success: true,
        item: itemData
      });
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

/************************
 * POST
 ************************/

router.post('/items/new', upload.single('image'), isAuthenticated, (req, res) => {
  const user = req.user;

  if (req.file) {
    const uploadParams = {
      Bucket: 'badmckinney-cms-photos',
      Key: '',
      Body: ''
    };
    const file = path.join(`/src/app/server/uploads/${req.file.filename}`);
    const fileStream = fs.createReadStream(file);

    fileStream.on('error', function (err) {
      throw new Error('File Error', err);
    });

    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(file);

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        fs.unlink(`/src/app/server/uploads/${req.file.filename}`, err => {
          if (err) {
            throw new Error(err);
          }
        });

        throw new Error('Error', err);
      } else if (data) {
        fs.unlink(`/src/app/server/uploads/${req.file.filename}`, err => {
          if (err) {
            throw new Error(err);
          }
        });

        const newItem = {
          created_by: user.id,
          category_id: parseInt(req.body.category_id),
          name: req.body.name,
          price: req.body.price ? parseInt(req.body.price) : null,
          image: data.Location,
          description: req.body.description,
          manufacturer: req.body.manufacturer,
          model: req.body.manufacturer,
          condition_id: parseInt(req.body.condition_id),
          length: req.body.length ? parseInt(req.body.length) : null,
          width: req.body.width ? parseInt(req.body.width) : null,
          height: req.body.height ? parseInt(req.body.height) : null,
          notes: req.body.notes,
          status_id: 1,
          views: 0
        };

        Item.forge(newItem)
          .save(null, { method: 'insert' })
          .then(newItem => {
            return res.json({
              id: newItem.id
            });
          })
          .catch(err => {
            res.status(500);
            res.json(err);
          });
      }
    });
  } else {
    const newItem = {
      created_by: user.id,
      category_id: parseInt(req.body.category_id),
      name: req.body.name,
      price: req.body.price ? parseInt(req.body.price) : null,
      image: req.body.image,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      model: req.body.manufacturer,
      condition_id: parseInt(req.body.condition_id),
      length: req.body.length ? parseInt(req.body.length) : null,
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
      notes: req.body.notes,
      status_id: 1,
      views: 0
    };

    Item.forge(newItem)
      .save(null, { method: 'insert' })
      .then(newItem => {
        return res.json({
          id: newItem.id
        });
      })
      .catch(err => {
        res.status(500);
        res.json(err);
      });
  }
}
);

/************************
 * PUT
 ************************/

router.put('/items/:id', isAuthenticated, (req, res) => {
  const item_id = req.params.id;
  const user_id = req.user.id;
  const editedItem = {
    category_id: req.body.category_id,
    name: req.body.name,
    price: req.body.price ? parseInt(req.body.price) : null,
    image: req.body.image,
    description: req.body.description,
    manufacturer: req.body.manufacturer,
    model: req.body.model,
    condition_id: req.body.condition_id,
    length: req.body.length ? parseInt(req.body.length) : null,
    width: req.body.width ? parseInt(req.body.width) : null,
    height: req.body.height ? parseInt(req.body.height) : null,
    notes: req.body.notes,
    status_id: req.body.status_id
  };

  Item.where({ id: item_id })
    .fetch()
    .then(item => {
      if (!item) {
        res.status(400);
        res.json({ error: "That item doesn't exist" });
      }

      if (item.attributes.created_by !== user_id) {
        res.status(400);
        res.json({ error: "You don't own that item" });
      }

      item
        .save(editedItem, { patch: true })
        .then(() => {
          res.json({
            success: true
          });
        })
        .catch(err => {
          res.status(500);
          res.json(err);
        });
    });
});

router.put('/items/:id/views', (req, res) => {
  const id = req.params.id;

  Item.where('id', id)
    .fetch()
    .then(item => {
      const newViews = ++item.attributes.views;

      item
        .save({ views: newViews }, { patch: true })
        .then(() => {
          res.json({ success: true });
        })
        .catch(err => {
          res.status(500);
          res.json(err);
        });
    })
    .catch(err => {
      res.status(500);
      res.json(err);
    });
});

/************************
 *  DELETE
 ************************/

router.delete('/items/:id', isAuthenticated, (req, res) => {
  const id = req.params.id;
  const user_id = req.user.id;

  new Item({ id: id })
    .fetch()
    .then(item => {
      if (!item) {
        res.status(400);
        res.json({ error: 'That item does not exist' });
      }

      if (item.attributes.created_by !== user_id) {
        res.status(400);
        res.json({ error: 'That item does not belong to you' });
      }
    })
    .destroy()
    .then(() => {
      Item.fetchAll({
        withRelated: ['createdBy', 'category', 'condition', 'status']
      })
        .then(items => {
          itemList = items.models;
          items = [];

          itemList.forEach(item => {
            item = item.attributes;
            const relations = item.relations;
            const condition = relations.condition.attributes;
            const category = relations.category.attributes;
            const createdBy = relations.createdBy.attributes;
            const status = relations.status.attributes;

            const itemData = {
              id: item.id,
              created_by: createdBy.username,
              status: status.name,
              category: category.name,
              condition: condition.name,
              name: item.name,
              image: item.image,
              description: item.description,
              price: item.price,
              manufacturer: item.manufacturer,
              model: item.model,
              dimensions: item.dimensions,
              created_at: item.created_at,
              updated_at: item.updated_at,
              notes: item.notes,
              views: item.views
            };

            items.push(itemData);
          });
          res.json(items);
        })
        .catch(err => {
          res.status(500);
          res.json(err);
        });
    });
});

module.exports = router;
