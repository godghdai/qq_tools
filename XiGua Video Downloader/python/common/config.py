import configparser


class ConfigParser(configparser.ConfigParser):
    def __init__(self, defaults=None):
        configparser.ConfigParser.__init__(self, defaults=defaults)

    def optionxform(self, optionstr):
        return optionstr


class Config:
    @staticmethod
    def load_config(config_filepath):
        con = ConfigParser()
        con.read(config_filepath)
        return con


if __name__ == '__main__':
    con = ConfigParser()
    con.read('./config.ini')
    # HEADERS = {item[0]: item[1] for item in config.items("HEADERS")}
    VIDEO_SAVE_DIR = con["BASE"]["VIDEO_SAVE_DIR"]
    CHUNK_COUNT = int(con["BASE"]["CHUNK_COUNT"])
    FFMPEG_PATH = con["BASE"]["FFMPEG_PATH"]


