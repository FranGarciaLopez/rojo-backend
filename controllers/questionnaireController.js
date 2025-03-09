const User = require('../models/User.js');
const Questionnaire = require('../models/Questionnaire.js');
const mongoose = require('mongoose');
const DataQuestionnaire = require('../scripts/questionnaireOBJ.js');
/*** Functions ****************************************************************
 * To catch the questions and the answers from the object, and retunr in a string
 * ***************************************************************************/
function get_text_answers_in_str(DataOBJ, field_separator = ';', lines_separator = '|\n', field_discrimination_word = 'Answer') {
    const fieldsArray = [];
    let fields_global_OBJ_str = []
    for (const key in DataOBJ) {
        let fields_curr_OBJ_str = []
        if (DataOBJ.hasOwnProperty(key)) {
            const item = DataOBJ[key];
            let fields_curr_OBJ = [];
            for (const field in item) {
                if (field.startsWith(field_discrimination_word)) {
                    fields_curr_OBJ = fields_curr_OBJ + item[field] + field_separator;
                }
            }
            fieldsArray.push(fields_curr_OBJ);
            fields_curr_OBJ_str = JSON.stringify(fields_curr_OBJ);
            fields_curr_OBJ_str = fields_curr_OBJ_str.slice(1, -2) + lines_separator;
        }
        fields_global_OBJ_str = fields_global_OBJ_str + fields_curr_OBJ_str;
    }
    return fields_global_OBJ_str;
}

function get_text_questions_formOBJ_in_str(DataOBJ, field_separator = ';', field_discrimination_word = 'Question') {
    const fieldsArray = [];
    for (const key in DataOBJ) {
        if (DataOBJ.hasOwnProperty(key)) {
            const item = DataOBJ[key];
            for (const field in item) {
                if (field.startsWith(field_discrimination_word)) {
                    fieldsArray.push(item[field]);
                }
            }
        }
    }
    return fieldsArray.join(field_separator);
}

/****************************************************************************/
const questionnaireController = {
    /*** SEND DATA ********************************************************
     * look for the id in the DB (questionnaires documents), if exist update A_str, otherwise, create a new document
     * note that: the id in the body is not the _id used by mongoDB.
     * any document in the DB will have: _id , id , A_str
     * ********************************************************************
     * POST METHOD. http://localhost:3000/questionnaire/send
     *                  Body { "id"     : "675b1084ec7dbcc8492512af", 
     *                          "A_str" : "1;2;3;4;kkkkkk"}
     **********************************************************************/
    async sendData(req, res) {
        try {
            const { id, A_str } = req.body;
            // Check for missing fields
            if (!id || !A_str) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            // Use findOneAndUpdate with upsert option
            const updatedEntry = await Questionnaire.findOneAndUpdate(
                { id }, // Search by `id` field
                { $set: { A_str } }, // Update `A_str`
                { new: true, upsert: true } // Return updated document, create if not exists
            );
            res.status(200).json({ message: 'Updated successfully', data: updatedEntry });
        } catch (error) {
            console.error('Error updating A_str:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    /*** GET id ***********************************************************
     * get the data of the user specified by id.
     * return in the json:
     *      id , A_str , TextQuestion , TextAnswer
     * GET METHOD. http://localhost:3000/questionnaire/get/:id
     *             ejemplo:  http://localhost:3000/questionnaire/get/670afbfe353d17d61b99cd99
     **********************************************************************/
    async getData(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const userEntry = await Questionnaire.findOne({ id: id });

            if (!userEntry) {
                return res.status(404).json({ message: 'No questionnaire found for this user' });
            }

            // Return structured data
            const responseData = {
                id: userEntry.id,
                questions: get_text_questions_formOBJ_in_str(DataQuestionnaire, ';'),
                answers: userEntry.A_str || '' // Return stored answers
            };

            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error fetching questionnaire:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    /*** GETAll ***********************************************************
     * get the questionnaire's data of all the users
     * GET METHOD. http://localhost:3000/questionnaire/getAll
     **********************************************************************/
    async getAll(req, res) {
        try {
            const AllQuestionnaire = await Questionnaire.find();
            res.status(200).json(AllQuestionnaire);
        } catch (error) {
            console.error('Error getting All Questionnaire:', error);
            res.status(500).json({ message: 'Error getting All Questionnaire', error });
        }
    },
    /*** GetQuestions ****************************************************
     * get the questions of the questionnaire. in order from the first question to the last.
     * an question will be separated by ;
     * all the questions are locally stored in ../scripts/questionnaireOBJ.js
     * GET METHOD. http://localhost:3000/questionnaire/getQuestions
     **********************************************************************/
    async getQuestions(req, res) {
        try {
            res.status(200).json(get_text_questions_formOBJ_in_str(DataQuestionnaire, ';'));
        } catch (error) {
            console.error('Error getting text of questions:', error);
            res.status(500).json({ message: 'Error getting text of questions', error });
        }
    },
    /*** GetAnswer ****************************************************
     * get the answer of the questionnaire. in order from the first question to the last.
     * the answers ( refered to same question) will be separated by ; 
     * the 'block of answers, refered to a new question, will be separated by |
     * Answer1-01;Answer2-01;Answer3-01;Answer4-01;Answer5-01|Answer1-02;Answer2-02;Answer3-02;Answer4-02;Answer5-02| 
     * all the answers are locally stored in ../scripts/questionnaireOBJ.js
     * GET METHOD. http://localhost:3000/questionnaire/getAnswer
     **********************************************************************/
    async getAnswer(req, res) {
        try {
            res.status(200).json(get_text_answers_in_str(DataQuestionnaire, ';', '|'));
        } catch (error) {
            console.error('Error getting text of questions:', error);
            res.status(500).json({ message: 'Error getting text of questions', error });
        }
    }
}
module.exports = questionnaireController;