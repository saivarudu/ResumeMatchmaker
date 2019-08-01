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
    # print("\nprinting the value of row1\n")
    # print(row1)
    my_row = []
    for ent in row1:
                ent = ent.lower()
                my_row.append(ent)
    row1 = my_row
    if(keyword in row1):
        # print("\nprinting row1.index(keyword)\n")
        # print(row1.index(keyword))  #It send the index at which that keyword is present.
        req_col1 = row1.index(keyword)
        #print("\nprinting req_col1\n")
        #print(req_col1)
        return req_col1 #returning the index at which keyword is present.
    else:
        return 10

# TO CALCULATE THE SCORE OF A PRTICULAR RESUME
# keyword_xl_path is path excel file containing keyword and respective score
# resume is the path of resume on which calculation to be done

def resume_score_calculation(keyword_xl_path, keyword, resume):
    complete_keyword_dict = {}
    resume_text = extract_text_from_pdf(resume)
    resume_text = resume_text.lower()
    keyword = keyword.lower()
    workbook = xlrd.open_workbook(keyword_xl_path)
    sheet = workbook.sheet_by_index(0)
    req_col1 = extract_req_column(keyword_xl_path, keyword)
    col_a1 = []
    col_b1 = []
    for i in range(0,6,2):
        col_a1 += sheet.col_values(i, 1)
    my_list = []
    for entries1 in col_a1:
                entries1 = entries1.lower()
                my_list.append(entries1)
    col_a1 = my_list
    for i in range(1,6,2):
        col_b1 += sheet.col_values(i, 1)
    
    # print("type of col_a1\n")
    # print(type(col_a1))
    # print(col_a1)
    # print(col_b1)
    complete_keyword_dict = {a: b for a, b in zip(col_a1, col_b1)}
    # print("\nprinting complete_keyword_dict\n")
    # print(complete_keyword_dict)
    if(req_col1==10):
        resume_score = 0
        if keyword in complete_keyword_dict:
            resume_score = complete_keyword_dict[keyword]

    else:
        my_list = []
        # print("\ntype of sheet.col_values(req_col1,1)\n")
        # print(type(sheet.col_values(req_col1, 1)))
        col_a = sheet.col_values(req_col1, 1)   #it is returning the response in a list
        # print("type of col_a\n")
        # print(type(col_a))
        for entries in col_a:
                entries = entries.lower()
                my_list.append(entries)
        col_a = my_list
        col_b = sheet.col_values(req_col1+1, 1)
        # print("type of col_a\n")
        # print(type(col_a))
        my_dict = {a: b for a, b in zip(col_a, col_b)}
        # print("\nprinting my_dict\n")
        # print(my_dict)
        resume_score = 0
        for word in resume_text.split():
            if word in my_dict:
                resume_score += my_dict[word]
        #print(resume_score)
    

    return resume_score


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
        response_array = []
        keyword = sys.argv
        print(keyword)
        keyword_xl_path = r'C:\Users\Hack5GURTeam32\Desktop\ResumeMatchmaker\ai_ml\hackathon\hackathonScript\keywords.xlsx'
        path = 'C:\\Users\\Hack5GURTeam32\\Desktop\\ResumeMatchmaker\\src\\assets\\files\\'
        files = []
        req_files = []
        for r,d,f in os.walk(path):
            for file in f:
                if '.pdf' in file:
                    files.append(os.path.join(r, file))

        for f in files:
            resume_text = extract_text_from_pdf(f)
            resume_text = resume_text.split()
            keyword = keyword[1:]
            flag = 0
            if(all(x in resume_text for x in keyword)):
                flag = 1
     
            if flag==1:
                req_files.append(f)
        
        for f in req_files:
            score=0
            for k in sys.argv[1:]:
                score+=resume_score_calculation(keyword_xl_path, k, f)
            response_array.append({'path': f,'strength': score})
        print(json.dumps(response_array))

        sys.stdout.flush()
