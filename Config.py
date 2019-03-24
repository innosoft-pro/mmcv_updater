from Singleton import Singleton

import configparser


class Config(metaclass=Singleton):
    file_name = "update_config.ini"
    __parser = configparser.ConfigParser(default_section="common")
    __parser.read(file_name)

    def write(self, section, key, value):
        if section not in self.__parser:
            self.__parser.add_section(section)
        self.__parser.set(section, key, value)
        with open(self.file_name, "w") as file:
            self.__parser.write(file)
        return True

    # Just a quick way to read the config data
    def get_parser(self):
        return self.__parser
