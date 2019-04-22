import configparser
import os

file_name = "update_config.ini"
parser = configparser.ConfigParser(default_section="common")
parser.read(file_name)


def write(section, key, value):
    if not os.path.exists(file_name):
        open(file_name, "tw").close()
    if section not in parser:
        parser.add_section(section)
    parser.set(section, key, value)
    with open(file_name, "w") as file:
        parser.write(file)
    return True
