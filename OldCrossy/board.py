from main import *


class Screen(p.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.imgWin = p.image.load("Pictures\scenes\You Win.png")
        self.imgScene = p.image.load("Pictures\scenes\Scene.png")
        self.imgLose = p.image.load("Pictures\scenes\You lose.png")

        self.imgWin = p.transform.scale(self.imgWin, (WIDTH, HEIGHT))
        self.imgScene = p.transform.scale(self.imgScene, (WIDTH, HEIGHT))
        self.imgLose = p.transform.scale(self.imgLose, (WIDTH, HEIGHT))

        self.image = self.imgScene

        self.x = 0
        self.y = 0

        self.rect = self.image.get_rect()

    def update(self, scroll):
        self.rect.topleft = (self.x, self.y)
        self.y += scroll