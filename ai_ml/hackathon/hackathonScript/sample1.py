import io
import os
import json
import sys 
import string
import xlrd
import re
import array as arr
from pdfminer.converter import TextConverter
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfpage import PDFPage

# IN ORDER TO GET THE COLUMN WHICH CONTAINS required
# KEYWORD AND ITS SCORE FROM KEYWORD.XLSX FILE.


def extract_req_column(keyword_xl_path, keyword):
    workbook = xlrd.open_workbook(keyword_xl_path)
    sheet = workbook.sheet_by_index(0)
    row1 = sheet.row_values(0)
    #print(row1)
    if(keyword in row1):
        req_col1 = row1.index(keyword)
        return req_col1

# TO CALCULATE THE SCORE OF A PRTICULAR RESUME
# keyword_xl_path is path excel file containing keyword and respective score
# resume is the path of resume on which calculation to be done


def resume_score_calculation(keyword_xl_path, keyword, resume, cand_name):
    workbook = xlrd.open_workbook(keyword_xl_path)
    sheet = workbook.sheet_by_index(0)
    req_col1 = extract_req_column(keyword_xl_path, keyword)
    my_list = []
    output_list = []
    col_a = sheet.col_values(req_col1, 1)
    for entries in col_a:
            entries = entries.lower()
            my_list.append(entries)
    col_a = my_list
    col_b = sheet.col_values(req_col1+1, 1)
    my_dict = {a: b for a, b in zip(col_a, col_b)}
    resume_text = extract_text_from_pdf(resume)
    resume_name = cand_name
    resume_text = resume_text.lower()
    phone_number_regex = re.compile(r'(0/91)?[7-9][0-9]{9}')
    contact_number = phone_number_regex.search(resume_text)
    email_regex = re.compile(r'[a-z.0-9]+\@[a-z]+\.com')
    email = email_regex.search(resume_text)
    experience_regex = re.compile(r'total experience\: [a-zA-Z0-9 ]+\.')
    experience = experience_regex.search(resume_text)
    resume_score = 0
    for word in resume_text.split():
        if word in my_dict:
            resume_score += my_dict[word]
    output_list = [resume_name,contact_number.group() if contact_number!=None else '',email.group() if email!=None else '',experience.group() if experience!=None else '',resume_score]
    return output_list


def extract_text_from_pdf(pdf_path):
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle)
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    with open(pdf_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh,
                                      caching=True,
                                      check_extractable=True):
            page_interpreter.process_page(page)
        text = fake_file_handle.getvalue()
    # close open handles
    converter.close()
    fake_file_handle.close()
    if text:
        return text


def extract_text_by_page(pdf_path):
    with open(pdf_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh,
                                      caching=True,
                                      check_extractable=True):
            resource_manager = PDFResourceManager()
            fake_file_handle = io.StringIO()
            converter = TextConverter(resource_manager, fake_file_handle)
            page_interpreter = PDFPageInterpreter(resource_manager, converter)
            page_interpreter.process_page(page)
            text = fake_file_handle.getvalue()
            yield text
            # close open handles
            converter.close()
            fake_file_handle.close()


def export_as_json(pdf_path, json_path):
    filename = os.path.splitext(os.path.basename(pdf_path))[0]
    data = {'Filename': filename}
    data['Pages'] = []
    counter = 1
    for page in extract_text_by_page(pdf_path):
        text = page[:]
        text = text.replace("\u00a0", "")
        page = {'Page_{}'.format(counter): text}
        data['Pages'].append(page)
        counter += 1
    with open(json_path, 'w') as fh:
        json.dump(data, fh)


if __name__ == '__main__':
        keyword = sys.argv[1]
        #print("the argument found is {}".format(keyword))
        #keyword = 'Angular'
        keyword_xl_path = r'C:\Users\Hack5GURTeam32\Desktop\ResumeMatchmaker\ai_ml\hackathon\hackathonScript\keywords.xlsx'
        #pdf_path = r'C:\Users\Hack5GURTeam32\Desktop\ResumeMatchmaker\src\assets\files\resume2.pdf'
        pdf_path = sys.argv[2]
        candidate_name = os.path.basename(pdf_path).split(".")[0].split("_")[0]+" "+os.path.basename(pdf_path).split(".")[0].split("_")[1]
        #json_path = 'resumes/data.json'
        score = resume_score_calculation(keyword_xl_path, keyword, pdf_path, candidate_name)
        # score = candidate_list[]
        #text = extract_text_from_pdf()
        #print(type(text))
        print(json.dumps(score))
        sys.stdout.flush()
        #export_as_json(pdf_path, json_path)
