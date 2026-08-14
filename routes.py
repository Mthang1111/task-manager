#API endpoints
#docs: https://www.sqlalchemy.org/

from flask import jsonify, request
from models import *
from app import db
from sqlalchemy import select


def register_routes(app):
    #Route for boards
    @app.route("/api/boards", methods = ["GET"]) # use /api endpoint, only respond with get(read) request

    def get_boards():
        querying = select(Board) #build the select * statement
        boards = db.session.execute(querying).scalars().all() #run the stmt against the database, then convert raw results to python objects
        return jsonify([{"id": b.id, "name": b.name} for b in boards])

    @app.route("/api/boards/<int:board_id>", methods = ["GET"])
    def get_board(board_id):
        board = db.session.get(Board, board_id)
        if board is None:
            return jsonify({"error": "board not found"}), 404
        return jsonify({"id": board.id, "name": board.name})

    @app.route("/api/boards", methods = ["POST"]) #only respond with post(write) request
    def make_boards():
        data = request.get_json()  #parse incoming http data as json

        if not data or "name" not in data: #catches when no JSON sent or missing required fields
            return jsonify({"error": "Missing field"}), 400

        board = Board(name = data["name"]) #create board object with requested data; anything that is autoset doesnt have to be called 
        #create session and add objects
        db.session.add(board) 
        db.session.commit()
        return jsonify({"id": board.id, "name": board.name}), 201

    @app.route("/api/boards/<int:board_id>", methods = ["DELETE"])
    def delete_board(board_id):
        target_board = db.session.get(Board, board_id) 
        if target_board is None: #session.get() can only return real object or None value
            return jsonify({"error":"board not found"}), 404
        db.session.delete(target_board)
        db.session.commit()
        return "",204

    @app.route("/api/boards/<int:board_id>", methods = ["PATCH"])
    def update_board(board_id):
        target_board = db.session.get(Board, board_id)
        if target_board is None:
            return jsonify({"error": "board not found"}), 404
        
        data = request.get_json()
        if not data:
           return jsonify({"error":"no data provided"}), 400
        
        if "name" in data:
            target_board.name = data["name"] 
        db.session.commit()
        
        return jsonify({"id": target_board.id, "name": target_board.name}), 200

    #Routes for lists
    @app.route("/api/boards/<int:board_id>/lists", methods = ["GET"]) 
    def get_lists(board_id):
        querying = select(List).where(List.board_id == board_id)
        lists = db.session.execute(querying).scalars().all() 
        return jsonify([{"id": l.id, "name": l.name, "position": l.position} for l in lists])

    @app.route("/api/boards/<int:board_id>/lists", methods = ["POST"]) 
    def make_list(board_id):
        data = request.get_json() 

        if not data or "name" not in data: 
            return jsonify({"error": "Missing field"}), 400

        new_list = List(board_id = board_id, name = data["name"], position = data.get("position")) #.get() wouldnt raise error if missing
        db.session.add(new_list) 
        db.session.commit()
        return jsonify({
            "id": new_list.id,
            "name": new_list.name,
            "position": new_list.position
        }), 201

    @app.route("/api/lists/<int:list_id>", methods=["DELETE"])
    def delete_list(list_id):
        target_list = db.session.get(List, list_id)
        if target_list is None:
            return jsonify({"error":"list not found"}), 404
        db.session.delete(target_list)
        db.session.commit()
        return "",204

    @app.route("/api/lists/<int:list_id>", methods = ["PATCH"])
    def update_list(list_id):
        target_list = db.session.get(List, list_id)
        if target_list is None:
            return jsonify({"error": "list not found"}), 404
        
        data = request.get_json()
        if not data:
           return jsonify({"error":"no data provided"}), 400
        
        if "name" in data:
            target_list.name = data["name"]
        if "position" in data:
            target_list.position = data["position"] 
        db.session.commit()

        return jsonify({
            "id": target_list.id, 
            "name": target_list.name, 
            "position": target_list.position
            }), 200

    #Routes for cards
    @app.route("/api/boards/<int:board_id>/lists/<int:list_id>/cards", methods = ["GET"]) 
    def get_cards(board_id, list_id):
        querying = select(Card).where(Card.list_id == list_id)
        cards = db.session.execute(querying).scalars().all() 
        return jsonify([{"id": c.id, "title": c.title, "description": c.description, "due_date": c.due_date, "position": c.position} for c in cards])

    @app.route("/api/boards/<int:board_id>/lists/<int:list_id>/cards", methods = ["POST"]) 
    def make_card(board_id, list_id):
        data = request.get_json() 

        if not data or "title" not in data: 
            return jsonify({"error": "Missing field"}), 400

        new_card= Card(list_id = list_id, title = data["title"], description = data.get("description"), due_date = data.get("due_date"), position = data.get("position")) 
        db.session.add(new_card) 
        db.session.commit()
        return jsonify({
            "id": new_card.id,
            "title": new_card.title,
            "description": new_card.description,
            "due_date": new_card.due_date,
            "position": new_card.position
        }), 201   

    @app.route("/api/cards/<int:card_id>", methods=["DELETE"])
    def delete_card(card_id):
        target_card = db.session.get(Card, card_id)
        if target_card is None:
            return jsonify({"error":"card not found"}), 404
        db.session.delete(target_card)
        db.session.commit()
        return "",204

    @app.route("/api/cards/<int:card_id>", methods = ["PATCH"])
    def update_card(card_id):
        target_card = db.session.get(Card, card_id)
        if target_card is None:
            return jsonify({"error": "card not found"}), 404
        
        data = request.get_json()
        if not data:
           return jsonify({"error":"no data provided"}), 400

        if "list_id" in data:
            target_card.list_id = data["list_id"]
        if "title" in data:
            target_card.title = data["title"]
        if "description" in data:
            target_card.description = data["description"] 
        if "due_date" in data:
            target_card.due_date = data["due_date"]
        if "position" in data:
            target_card.position = data["position"]
        db.session.commit()
        
        return jsonify({
            "id": target_card.id,
            "list_id": target_card.list_id,
            "title": target_card.title,
            "description": target_card.description,
            "due_date": target_card.due_date,
            "position": target_card.position
            }), 200    

    #Routes for labels  
    @app.route("/api/labels", methods = ["GET"]) 
    
    def get_labels(): #return all labels across all cards
        querying = select(Label)
        labels = db.session.execute(querying).scalars().all() 
        return jsonify([{"id": l.id, "label": l.label, "color": l.color} for l in labels])

    @app.route("/api/cards/<int:card_id>/labels", methods=["GET"])
    def get_card_labels(card_id): #return all labels of a card
        querying = (
            select(Label)
            .join(CardLabel, CardLabel.label_id == Label.id)
            .where(CardLabel.card_id == card_id)
        )
        labels = db.session.execute(querying).scalars().all()
        return jsonify([{"id": l.id, "label": l.label, "color": l.color} for l in labels])


    @app.route("/api/labels", methods = ["POST"]) 
    def make_labels():
        data = request.get_json()  
    
        if not data or "label" not in data or "color" not in data: 
            return jsonify({"error": "Missing field"}), 400
    
        new_label = Label(label = data["label"], color = data["color"]) 
        db.session.add(new_label) 
        db.session.commit()
        return jsonify({
            "id": new_label.id, 
            "label": new_label.label,
            "color": new_label.color
        }), 201

    @app.route("/api/labels/<int:label_id>", methods=["DELETE"])
    def delete_label(label_id):
        target_label = db.session.get(Label, label_id)
        if target_label is None:
            return jsonify({"error":"label not found"}), 404
        db.session.delete(target_label)
        db.session.commit()
        return "",204

    @app.route("/api/labels/<int:label_id>", methods=["PATCH"])
    def update_label(label_id):
        target_label = db.session.get(Label, label_id)
        if target_label is None:
            return jsonify({"error": "label not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "no data provided"}), 400

        if "label" in data:
            target_label.label = data["label"]
        if "color" in data:
            target_label.color = data["color"]
        db.session.commit()

        return jsonify({
            "id": target_label.id,
            "label": target_label.label,
            "color": target_label.color
        }), 200

    #Routes for card_labels
    @app.route("/api/cards/<int:card_id>/labels/<int:label_id>", methods = ["POST"])
    def add_label_to_card(card_id, label_id):
        card = db.session.get(Card, card_id)
        if card is None:
            return jsonify({"error": "card not found"}), 404

        label = db.session.get(Label, label_id)
        if label is None:
            return jsonify({"error": "label not found"}), 404

        querying = select(CardLabel).where(
            CardLabel.card_id == card_id, CardLabel.label_id == label_id
        )
        existing = db.session.execute(querying).scalar_one_or_none()
        if existing is not None:
            return jsonify({"error": "label already attached to card"}), 409

        new_sets = CardLabel(card_id = card_id, label_id = label_id)
        db.session.add(new_sets)
        db.session.commit()
        return jsonify({
            "card_id": new_sets.card_id,
            "label_id": new_sets.label_id
        }), 201

    @app.route("/api/cards/<int:card_id>/labels/<int:label_id>", methods = ["DELETE"])
    def remove_label_from_card(card_id, label_id):
        querying = select(CardLabel).where(CardLabel.card_id == card_id, CardLabel.label_id == label_id)
        card_label = db.session.execute(querying).scalar_one_or_none()
        if card_label is None:
            return jsonify({"error": "Missing"}), 404 
        db.session.delete(card_label)
        db.session.commit()
        return "", 204
